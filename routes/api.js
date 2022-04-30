var express = require('express');
var router = express.Router();
var dbConn  = require('../lib/db');
 


// display books page
router.get('/', function(req, res, next) {
   
    dbConn.query('SELECT * FROM objeto_museable ORDER BY id desc',function(err,rows)     {
 
        if(err) {
            req.flash('error', err);
            // render to views/books/index.ejs
            res.render('objetos',{data:''});
        } else {
            // render to views/books/index.ejs
            res.json({data:rows});
        }
    });
});


// display show book page
router.get('/show/(:id)', function(req, res, next) {

    let id = req.params.id;
     dbConn.query('SELECT * FROM objeto_museable WHERE id = ' + id, function(err, rows, fields) {
        if(err) throw err
         
        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'No se encontró objeto con id = ' + id)
            res.redirect('/')
        }
        // if book found
        else {
            // render to edit.ejs
        
            res.json( {
                id: rows[0].id,
                nombre: rows[0].nombre,
                descripcion: rows[0].descripcion
            })
        }
    })
})

   





module.exports = router;