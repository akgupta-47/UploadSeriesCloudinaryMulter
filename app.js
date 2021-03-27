const express = require('express');
const multer = require('multer');
// const sharp = require('sharp');
const cloudinary = require("cloudinary").v2;
const cloudinaryStorage = require("cloudinary-multer");
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

const storage = cloudinaryStorage({
    cloudinary: cloudinary,
});

// Init upload variable, .single- specify to allow only single image upload
const upload = multer({
    storage,
    limits: {fileSize: 1000000},
    fileFilter: (req,file,cb) => {
        checkFileType(req, file, cb);
    } 
}).single();

// check file type
const checkFileType = (req, file, cb) => {
    // Allowed extension
    const fileTypes = /jpeg|jpg|png|gif/;
    // check ext
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    // check mimetypes
    const mimetype = fileTypes.test(file.mimetype);

    file.filename = `${req.file.fieldname}-${Date.now()}${path.extname(req.file.originalname)}`;

    if(mimetype && extname) {
        return cb(null, true);
    }else {
        cb('Error: Images only');
    }
}

/*
// Resize image to particular needs
const ImageResizer = async (req,res, next) => {
    if (!req.file) return;
    // console.log(typeof req.next);

    req.file.filename = `${req.file.fieldname}-${Date.now()}${path.extname(req.file.originalname)}`;
  
    await sharp(req.file.buffer)
      .resize(500, 500)
      .toFile(`./public/uploads/${req.file.filename}`, 
        (err) => {
            if (err) {
                res.render('index', {
                    msg: err
                })
            }else{
                // console.log(req.file);
                // res.send('test');
                if(req.file == undefined) {
                    res.render('index', {
                        msg: 'Error: File not submitted!!'
                    });
                }else{
                    res.render('index', {
                        msg: 'File Uploaded!!',
                        file: `uploads/${req.file.filename}`
                    })
                }
            }
        });
}
*/

// Init app variable
const app = express();

app.post('/upload',upload, async (req, res) => {
    try{
        const doc = await Basic.create(req.body);
    }catch(error){
        console.log(error);
    }
});

const port = 3000 || PROCESS.env.PORT;

app.listen(port, () => console.log(`Server listening on port ${port}`));
