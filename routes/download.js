const router = require('express').Router();
const db = require("../config/db");

router.get('/:uuid', async (req, res) => {
   try{
      db.query(`SELECT * FROM files WHERE uuid="${req.params.uuid}";`, function (err, file){
          if(err){
             return res.status(500).json({
                status: "FAILED",
                message: "Internal Server Error"
               })
            }else{
             if(!file) {
                  return res.render('download', { error: 'Link has been expired.'});
             } 
             console.log(file)
             const filePath = `${__dirname}/../uploads/${file[0].filename}`;
             res.download(filePath);
          }
      })
  }catch(err){
      return res.status(500).json({
          status: "FAILED",
          message: "Internal Server Error"
      })
  }
});

module.exports = router;
