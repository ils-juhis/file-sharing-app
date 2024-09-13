const router = require('express').Router();
const db = require("../config/db");

router.get('/:uuid', async (req, res) => {
    try {
        db.query(`SELECT * FROM files WHERE uuid=${req.params.uuid};`, function (err, file){
            if(err){
                return res.status(500).json({
                    status: "FAILED",
                    message: "Internal Server Error"
                })
            }else{
               if(!file) {
                    return res.render('download', { error: 'Link has been expired.'});
               } 
               return res.render('download', { uuid: file[0].uuid, fileName: file[0].filename, fileSize: file[0].size, downloadLink: `${process.env.APP_BASE_URL}/files/download/${file[0].uuid}` });

            }
        })

    } catch(err) {
        return res.render('download', { error: 'Something went wrong.'});
    }
});


module.exports = router;