const multer = require('multer');
const fs = require('fs');

const dircheck = (...paths)=>{
    let total = "";
    while(paths.length > 0){
        let [first] = paths.slice(0,1);
        paths = paths.slice(1);
        if(total === "") total = first;
        else total += "/" + first;
        if(!fs.existsSync(total)) fs.mkdirSync(total);
    }
    return total;
};

const random = (min, max)=>{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const namecheck = (path, length)=>{
    const list = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
    while(true){
        let name = "";
        while(length){
            name += list.charAt(random(0, list.length - 1));
            length -= 1;
        }
        if(!fs.existsSync(path + `/${name}`)) return name;
    }
};

const storage = multer.diskStorage({
    destination:(req,file,done)=>{
        let now = new Date();
        done(
            null, 
            dircheck(
                "resources", 
                "zips", 
                `${now.getFullYear()}`, 
                `${now.getMonth() + 1}`, 
                `${now.getDate()}`
            )
        );
    },
    filename:(req,file,done)=>{
        file.originalname = Buffer.from(file.originalname, 'latin1').toString("utf8");
        let now = new Date();
        let path =  dircheck(
            "resources", "zips", 
            `${now.getFullYear()}`, `${now.getMonth() + 1}`, `${now.getDate()}`
        );
        done(null, namecheck(path, 30) + 
            file.originalname.slice(file.originalname.lastIndexOf(".")));
    }
});

const multer_option = {
    storage:storage,
    limits:{
        fileSize:1024*1024*10,
        files:5
    },
    fileFilter:(req,file,done)=>{
        console.log(file);
        if(!file.mimetype.startsWith("application")) done(null, false);
        else{
            if(["zip","7zip"]
                .find(ext=>file.originalname.toLowerCase().endsWith(ext)))
                done(null, true);
            else
                done(null, false);
        }
    }
};

module.exports = multer(multer_option);