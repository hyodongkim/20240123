const express = require('express');
const app = express({xPoweredBy:false});
const upload = require('./image');
const zipupload = require('./zip');
const axios = require('axios');
/**
 * axios({option}) - 기본 사용법
 * axios.get(url,{option})
 * axios.post(url,{option}) - method:post 제외
 * axios.create({option})
 */
// let fet = 
//     async (url, http)=>await fetch(url, {method:http});
// fet('url','get');


app.set('view engine', 'ejs');
app.set('views', 'templates');

app.use(require('./setting'));


const apiServer = axios.create({
    baseURL:`http://localhost:${process.env.ALLOW_PORT}`,
    // transformResponse:(),
    // transformRequest:()
    // headers,params,data,timeout,withCredentials
    maxRedirects:5
});


app.post('/upload/zip/single', zipupload.single("file"), (req,res,next)=>{
    if(req.file) res.status(200).send("ok");
    else res.status(500).send("fail");
});
app.post('/upload/zip/any', zipupload.any(), (req,res,next)=>{
    if(req.files) res.status(200).send("ok");
    else res.status(500).send("fail");
});
app.post('/upload/image/single', upload.single("file"), (req,res,next)=>{
    if(req.file) res.status(200).send("ok");
    else res.status(500).send("fail");
});
app.post('/upload/image/any', upload.any(), (req,res,next)=>{
    if(req.files) res.status(200).send("ok");
    else res.status(500).send("fail");
});

app.get('/boardwrite', (req,res,next)=>{
    res.render('board');
});

app.get('/boardread', async (req,res,next)=>{
    let result = 
    (await apiServer.post(
        '/board',{
            id:req.query.id,
            content:req.query.content
        }
    )).data;
    res.render('boards', {boardlist:result});
});

app.post('/boardwrite', async (req,res,next)=>{
    let result = 
    (await apiServer.put(
        '/board/write',{
            data:{
                id:req.body.id,
                content:req.body.content
            }
        }
    )).data;
    if(result.data) res.redirect('/home');
    else res.redirect('/error');
});

app.get('/totaluser', async (req,res,next)=>{
    res.send((await apiServer.post(
        '/user/total'
    )).data);
});

app.get('/login', (req,res,next)=>{
    res.render('login');
});
app.get('/signup', (req,res,next)=>{
    res.render('signup');
});

app.post('/signup', async (req,res,next)=>{
    let result = 
        (await apiServer.put(
            '/user',{
                data:{
                    id:req.body.id,
                    pw:req.body.pw
                }
            }
        )).data;
    if(result.data) res.redirect('/login');
    else res.redirect("/signup");
});

app.post('/login', async (req,res,next)=>{
    // put, delete, patch
    let result = 
        (await apiServer.post(
            '/user',{
                id:req.body.id,
                pw:req.body.pw
            }
        )).data;
    if(!result.id) res.redirect('/login');
    else res.redirect('/home');
});

module.exports = app;