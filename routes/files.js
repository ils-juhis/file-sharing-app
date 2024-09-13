const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const db = require("../config/db");

let storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/') ,
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
              cb(null, uniqueName)
    } ,
});

let upload = multer({ storage, limits:{ fileSize: 1000000 * 100 }, }).single('myfile'); //100mb

router.post('/', (req, res) => {
  
  upload(req, res, async (err) => {
    if (err) {
        return res.status(500).send({ error: err.message });
      }
      console.log(req.file)
      let uuid = uuidv4();
      db.query(`INSERT INTO files (filename, uuid, path, size) VALUE ("${req.file.filename}", "${ uuid}", "upload${req.file.filename}", "${ req.file.size}");`, function (err, file){
        if(err){
          console.log(err)
            return res.status(500).json({
                status: "FAILED",
                message: "Internal Server Error"
            })
        }else{
          res.json({ file: `${process.env.APP_BASE_URL}/files/${uuid}` });
        }
      })
    })
});

router.post('/send', async (req, res) => {
  const { uuid, emailTo, emailFrom, expiresIn } = req.body;
  if(!uuid || !emailTo || !emailFrom) {
      return res.status(422).send({ error: 'All fields are required except expiry.'});
  }
  // Get data from db 
  try {
    db.query(`SELECT * FROM files WHERE uuid="${uuid}";`, function (err, file){
      if(err){
        console.log(err)
          return res.status(500).json({
              status: "FAILED",
              message: "Internal Server Error"
          })
      }else{
         
        if(file[0].sender) {
          return res.status(422).send({ error: 'Email already sent once.'});
        }
        file[0].sender = emailFrom;
        file[0].receiver = emailTo;
        // send mail
        const sendMail = require('../services/mailService');
        sendMail({
          from: emailFrom,
          to: emailTo,
          subject: 'inShare file sharing',
          text: `${emailFrom} shared a file with you.`,
          html: require('../services/emailTemplate')({
                    emailFrom, 
                    downloadLink: `${process.env.APP_BASE_URL}/files/download/${file[0].uuid}?source=email` ,
                    size: parseInt(file[0].size/1000) + ' KB',
                    expires: '24 hours'
                })
        }).then(() => {
          return res.json({success: true});
        }).catch(err => {
          return res.status(500).json({error: 'Error in email sending.'});
        });
      }
  })
} catch(err) {
  return res.status(500).send({ error: 'Something went wrong.'});
}

});

module.exports = router;