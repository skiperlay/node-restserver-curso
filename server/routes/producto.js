const express = require('express');

//libreria que permite ,entre otras cosas,regresar una copia del objeto filtrando los valores que necesito
const _ = require('underscore'); //npm install underscore

const { verificarToken } = require('../middlewares/autenticacion');


let app = express();
let Producto = require('../models/producto');

// ========================
//  Obtener productos
// ========================
app.get('/productos', verificarToken, (req, res) => {
    //trae todos los productos
    //populate/ usuario categoria
    //paginado

    let desde = req.query.desde || 0;
    let hasta = req.query.hasta || 5;
    desde = Number(desde);
    hasta = Number(hasta);
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
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(hasta)
        .populate('Usuario', 'nombre email')
        .populate('Categoria', 'descripcion')
        .sort('nombre')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            Producto.countDocuments({ disponible: true }, (err, conteo) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }

                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                })

            })

        })

})


// ========================
//  Obtener productos por ID
// ========================
app.get('/productos/:id', verificarToken, (req, res) => {
        //populate/ usuario categoria
        //paginado

        let id = req.params.id;

        Producto.find({ _id: id })
            .populate('Usuario', 'nombre email')
            .populate('Categoria', 'descripcion')
            .exec((err, productoDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                }
                if (!productoDB) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }

                res.json({
                    ok: true,
                    productoDB
                })

            })

    })
    // ========================
    //  Buscar productos
    // ========================
app.get('/productos/buscar/:termino', verificarToken, (req, res) => {
    //populate/ usuario categoria
    //paginado

    /*
    el término va a contener las palabras de búsqueda que el usuario escribe para encontrar lo que
    quiere, por lo tanto tiene que ser flexible.
    si el término lo pongo directamente en la función "find({descripcion=termino})" entonces habrá
    que ponerlo exactamente igual que está ne la base de datos para que haga match.
    */
    let termino = req.params.termino;

    /*
    para que la busqueda sea mas flexible hay que mandar una expresión regular a la que llamaremos
    "let regex = new RegExp()" siendo "new RegExp()" una función de JS.
    RegExp('1','2').
    1 -> parámetro 1 determina en función de que se hace la expresión regular, en este caso en función del termino
    2 -> parámetro 2 determina en este caso con la 'i' que queremos que sea insensible a mayusculas y minusculas
    */
    let regex = new RegExp(termino, 'i')

    Producto.find({ nombre: regex })
        .populate('Usuario', 'nombre email')
        .populate('Categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productos
            })

        })

})

// ========================
//  Crear un nuevo producto
// ========================
app.post('/productos', verificarToken, (req, res) => {
    // grabar el usuario
    // grabar una categoria del listado

    let body = req.body;
    let usuario = req.decoded._id;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario
    })

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        return res.status(201).json({
            ok: true,
            productoDB
        })

    })
})

// ========================
//  Actualizar un producto
// ========================
app.put('/productos/:id', verificarToken, (req, res) => {

    let id = req.params.id;
    let body = req.body;

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no existe'
                }
            })
        }

        productoDB.nombre = body.nombre;
        productoDB.precioUni = body.precioUni;
        productoDB.categoria = body.categoria;
        productoDB.disponible = body.disponible;
        productoDB.descripcion = body.descripcion;

        productoDB.save((err, productoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                })
            }

            res.json({
                ok: true,
                productoGuardado
            })
        })
    })






})

// ========================
//  Borrar un producto
// ========================
app.delete('/productos/:id', verificarToken, (req, res) => {
    // No borrar fisicamente sino cambiar el estado del disponible

    let id = req.params.id;

    let options = {
        new: true,
        runValidators: true
    }
    let cambiaEstado = {
        disponible: false
    }

    Producto.findByIdAndUpdate(id, cambiaEstado, options, (err, productoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }
        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        return res.json({
            ok: true,
            productoDB,
            message: 'Producto borrado'
        })
    })

})



module.exports = app;