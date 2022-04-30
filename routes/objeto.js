var express = require('express');
var router = express.Router();
var dbConn  = require('../lib/db');
var qr = require("qrcode");

// display books page
router.get('/', function(req, res, next) {

    dbConn.query('SELECT * FROM objeto_museable ORDER BY id desc',function(err,rows)     {

        if(err) {
            req.flash('error', err);
            // render to views/books/index.ejs
            res.render('objetos',{data:''});
        } else {
            // render to views/books/index.ejs
            res.render('objetos',{data:rows});
        }
    });
});

// display add book page
router.get('/add', function(req, res, next) {
    // render to add.ejs
    res.render('objetos/add', {
        nombre: '',
        descripcion: ''
    })
})

// add a new book
router.post('/add', function(req, res, next) {

    let nombre = req.body.nombre;
    let descripcion = req.body.descripcion;
    let errors = false;

    if(nombre.length === 0 || descripcion.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Please enter name and author");
        // render to add.ejs with flash message
        res.render('objetos/add', {
            nombre: nombre,
            descripcion: descripcion
        })
    }

    // if no error
    if(!errors) {

        var form_data = {
            nombre: nombre,
            descripcion: descripcion
        }

        // insert query
        dbConn.query('INSERT INTO objeto_museable SET ?', form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)

                // render to add.ejs
                res.render('objetos/add', {
                    nombre: form_data.nombre,
                    descripcion: form_data.descripcion
                })
            } else {
                req.flash('success', 'Objeto Museable añadido exitosamente');
                res.redirect('/objetos');
            }
        })
    }
})

// display edit book page
router.get('/edit/(:id)', function(req, res, next) {

    let id = req.params.id;

    dbConn.query('SELECT * FROM objeto_museable WHERE id = ' + id, function(err, rows, fields) {
        if(err) throw err

        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'No se encontró objeto con id = ' + id)
            res.redirect('/objetos')
        }
        // if book found
        else {
            // render to edit.ejs
            res.render('objetos/edit', {
                title: 'Editar Objeto',
                id: rows[0].id,
                nombre: rows[0].nombre,
                descripcion: rows[0].descripcion
            })
        }
    })
})

// display show book page
router.get('/show/(:id)', function(req, res, next) {

    let id = req.params.id;
    dbConn.query('SELECT * FROM objeto_museable WHERE id = ' + id, function(err, rows, fields) {
        if(err) throw err

        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'No se encontró objeto con id = ' + id)
            res.redirect('/objetos')
        }
        // if book found
        else {
            // render to edit.ejs

            res.render('objetos/show', {
                title: 'Mostrar Objeto',
                id: rows[0].id,
                nombre: rows[0].nombre,
                descripcion: rows[0].descripcion
            })
        }
    })
})

// update book data
router.post('/update/:id', function(req, res, next) {

    let id = req.params.id;
    let nombre = req.body.nombre;
    let descripcion = req.body.descripcion;
    let errors = false;

    if(nombre.length === 0 || descripcion.length === 0) {
        errors = true;

        // set flash message
        req.flash('error', "Por favor, entre el nombre y la descripcion");
        // render to add.ejs with flash message
        res.render('objetos/edit', {
            id: req.params.id,
            nombre: nombre,
            descripcion: descripcion
        })
    }

    // if no error
    if( !errors ) {

        var form_data = {
            nombre: nombre,
            descripcion: descripcion
        }
        // update query
        dbConn.query('UPDATE objeto_museable SET ? WHERE id = ' + id, form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('objetos/edit', {
                    id: req.params.id,
                    nombre: form_data.nombre,
                    descripcion: form_data.descripcion
                })
            } else {
                req.flash('success', 'Objeto modificado exitosamente');
                res.redirect('/objetos');
            }
        })
    }
})

// delete book
router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;

    dbConn.query('DELETE FROM objeto_museable WHERE id = ' + id, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err)
            // redirect to books page
            res.redirect('/objetos')
        } else {
            // set flash message
            req.flash('success', 'Objeto eliminado exitosamente! ID = ' + id)
            // redirect to books page
            res.redirect('/objetos')
        }
    })
})


// display scan id book page
router.get('/scan/(:id)', function(req, res, next) {

    let id = req.params.id;
    let ulr;
    var ip=getIPAddress();
    if(ip=='0.0.0.0'){
        url="http://localhost:3000/api/show/"+id;
    }else{
        url="http://"+ip+":3000/api/show/"+id;
    }


    if (url.length === 0) res.send("No hay información!");
    console.log(url);
    // Let us convert the input stored in the url and return it as a representation of the QR Code image contained in the Data URI(Uniform Resource Identifier)
    // It shall be returned as a png image format
    // In case of an error, it will save the error inside the "err" variable and display it

    qr.toDataURL(url, (err, src) => {
        if (err) res.send("Ocurrió un error");
        console.log(url);
        // Let us return the QR code image as our response and set it to be the source used in the webpage
        res.render("objetos/scan", { src,id });
    });
})

//devuelve la direccion ip de la maquina
function getIPAddress() {
    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];

        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                return alias.address;
        }
    }

    return '0.0.0.0';
}


module.exports = router;