const express = require('express');

//libreria que permite ,entre otras cosas,regresar una copia del objeto filtrando los valores que necesito
const _ = require('underscore'); //npm install underscore

let { verificarToken, verificarAdmin_Role } = require('../middlewares/autenticacion');

let app = express();

let Categoria = require('../models/categoria');


// =============================
// Mostrar todas las categorías
// =============================
app.get('/categoria', verificarToken, (req, res) => {

    /* 
    se puede hacer así 
    "Categoria.find({}, (err, categoriasDB) => {"
    pero es mejor hacerlo de la siguiente forma para poder añadirle funcionalidades
    entre el "find()" y el momento en que se ejecuta "exec()".

    una funcionalidad será en esta ocasión "populate()"
    "populate()" revisa los "objectId" que existen dentro del documento y cargan su información.
    Para ello recibe un parámetro que es el nombre del atributo que contiene dicho "objectId"
    el segundo parámetro es un string que recoge todos los campos que quiero que devulva del "objectId"
    en caso de querer llenar o popular varios "objectId":
    .populate('usuario', 'nombre email')
    .populate('producto', 'nombre codigo')

    Otra funcionalidad será "sort()" que ordena los datos devueltos por el atributo que se pasa
    por parámeto en la función "sort()"
    */
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categoriasDB) => {
            if (err) {

                return res.status(400).json({
                    ok: false,
                    err
                })
            }

            if (categoriasDB) {

                Categoria.countDocuments({}, (err, conteo) => {

                    if (err) {
                        return res.status(400).json({
                            ok: false,
                            err
                        })
                    }

                    res.json({
                        ok: true,
                        categoriasDB,
                        cuantos: conteo
                    })

                })


            }
        })

})

// =============================
// Mostrar una categoría por ID
// =============================
app.get('/categoria/:id', verificarToken, function(req, res) {

    let id = req.params.id;

    Categoria.findById(id, (err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        return res.json({
            ok: true,
            usuarioDB
        })
    });
})

// =============================
// Crear nueva categoría
// =============================
app.post('/categoria', verificarToken, (req, res) => {
    //regresa la nueva categoría
    // "req.body" esto viene del bodyparser (post)
    let body = req.body;
    let usuario = req.decoded._id;

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario
    });

    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        return res.json({
            ok: true,
            categoriaDB
        })
    });
})

// =============================
// Actualizar categoría
// =============================
app.put('/categoria/:id', verificarToken, (req, res) => {

    let id = req.params.id;
    let body = _.pick(req.body, ['descripcion']);

    let options = {
        new: true
    }

    Categoria.findByIdAndUpdate(id, body, options, (err, categoriaBd) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        return res.json({
            ok: true,
            categoriaBd
        })
    });



})

// =============================
// Borrar categoría
// =============================
app.delete('/categoria/:id', [verificarToken, verificarAdmin_Role], (req, res) => {
    //solo un administrador puede borrar categorías

    let id = req.params.id;

    let options = {
        new: true // hace que al actualizar un campo devuelva en la respuesta el objeto ya actualizado
    }
    Categoria.findByIdAndRemove(id, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        return res.json({
            ok: true,
            categoriaDB
        })

    })


})

module.exports = app;