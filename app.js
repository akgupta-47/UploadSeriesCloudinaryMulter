const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
// const sharp = require('sharp');
const cloudinary = require("cloudinary").v2;
// const cloudinaryStorage = require("cloudinary-multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require('path');
const mongoose = require('mongoose');
const Basic = require('./basicModel');

const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful still'));

// main part
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

let newFileName;
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        public_id: (req, file) => `${file.originalname.split('.')[0]}-${Date.now()}`
        // folder: "photos",
        // allowedFormats: ['jpg', 'jpeg', 'png'],
        // transformation: [{ width: 960, height: 960, crop: "limit" }],
        // filename: (req, file, callback) => {
        // const name = `${req.file.fieldname}-${Date.now()}${path.extname(req.file.originalname)}`;
        // callback(undefined, name);
        // }
    }
});  

// Init upload variable, .single- specify to allow only single image upload
let upload;
try{
    
    upload = multer({
    storage,
    limits: {fileSize: 1000000},
    fileFilter: (req,file,cb) => {
        checkFileType(req, file, cb);
    } 

}).single("image");
}catch(error){
    console.log(error);
}

// check file type
const checkFileType = (req, file, cb) => {
    // Allowed extension
    const fileTypes = /jpeg|jpg|png|gif/;
    // check ext
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    // check mimetypes
    const mimetype = fileTypes.test(file.mimetype);

    // file.originalname = `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`;
    // console.log(file);

    if(mimetype && extname) {
        return cb(null, true);
    }else {
        cb('Error: Images only');
    }
}

// Init app variable
const app = express();

// // EJS
// app.set('view engine', 'ejs');
// //Public folder
// app.use(express.static('./public'));

app.post('/upload',upload, async (req, res) => {
    try{
        // res.json({
        //     file: req.file,
        //     body: req.body,
        // });
        const doc = await Basic.create({
            menu: req.file.path,
            name: req.body.name,
        });

        res.status(200).json({
            status: 'success',
            data: {
              data: doc,
            },
          });
    }catch(error){
        console.log(error);
    }
});

const port = 3000 || PROCESS.env.PORT;

app.listen(port, () => console.log(`Server listening on port ${port}`));