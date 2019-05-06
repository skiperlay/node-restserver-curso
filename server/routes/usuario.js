const express = require('express');

//usamos un método hash de una sola via para que sea imposible reconstruir lo encriptado
const bcrypt = require('bcrypt'); //npm i bcrypt --save

//libreria que permite ,entre otras cosas,regresar una copia del objeto filtrando los valores que necesito
const _ = require('underscore'); //npm install underscore

//declaro un objeto usuario procedente del modelo Usuario de los ficheros "MODELOS"
const Usuario = require('../models/usuario');

//importo el midleware generado por mi
const { verificarToken, verificarAdmin_Role } = require('../middlewares/autenticacion');


const app = express();

//este servicio devuelve una consulta de usuarios 
app.get('/usuario', verificarToken, (req, res) => {


    //los parámetros opcionales caen en el objeto req.query
    // los parámetros opcionales se mandan por la url con un signo ? /usuario?desde=10&limite=10
    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);
    //el segundo parámetro de la función find() es opcional y es un string que determina
    //los campos a devolver

    Usuario.find({ estado: true }, 'nombre email role estado google img')
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                })
            }
            // las llaves de la función count() recogen las mismas condiciones que recoge el find() 
            //la función count() devuelve el número de ocurrencias segun las condiciones que estén en las llaves
            Usuario.countDocuments({ estado: true }, (err, conteo) => {

                if (err) {
                    return res.status(400).json({
                        ok: false,
                        err
                    })
                }

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                })

            })


        })


})

//este servicio genera un nuevo usuario
app.post('/usuario', [verificarToken, verificarAdmin_Role], function(req, res) {
    // "req.body" esto viene del bodyparser (post)
    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        //bcrypt->es el objeto ; hashSync->metodo de encriptación;parámetro 1->cadena a encriptar; parámetro 2->vueltas que se le quieren dar.
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });

    usuario.save((err, usuarioDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        //usuarioDB.password = null;

        res.json({
            ok: true,
            usuario: usuarioDB
        })
    });

    // if (body.nombre === undefined) {
    //     res.status(400).json({
    //         ok: false,
    //         mensaje: 'El nombre es necesario'
    //     });
    // } else {
    //     res.json({
    //         persona: body
    //     })
    // }
})

//este servicio modifica un usuario existente
app.put('/usuario/:id', [verificarToken, verificarAdmin_Role], function(req, res) {
    //req.params trae los parámetros pasados por url "get" (/usuario:id)
    //obtener parámetro pasado por la url de put 
    let id = req.params.id;
    //req.body trae los parametros pasados por "post"
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado', ]);


    // delete body.password;
    // delete body.google;
    // esto borra los atributos del objeto para que no se puedan modificar si se mandan en post
    // pero es ineficiente si hay muchos atributos que eliminar asi que se utiliza una librería
    //  .js npm install underscore

    // La función pick( ) del objeto "_" (underscore) precisamente filtra los atributos que se pueden modificar


    let options = {
        new: true, // hace que al actualizar un campo devuelva en la respuesta el objeto ya actualizado
        runValidators: true // valida que las nuevas entradas se ajusten a las restricciones especificadas en el esquema del modelo
    }

    //Como 2º parámetro del metodo siguiente se puede poner un objeto que contenga
    //los atributos que queremos cambiar, como queremos cambiar el body completo pues 
    //lo mandamos tal cual
    //En cuanto al 3º parámetro se pueden usar opciones disponibles en la documentación de moongose
    Usuario.findByIdAndUpdate(id, body, options, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }


        res.json({
            ok: true,
            usuario: usuarioDB
        })

    })



})

//este delete solo marca como desactivado la ocurrencia coincidente con el id
app.delete('/usuario/:id', [verificarToken, verificarAdmin_Role], function(req, res) {

    //req.params trae los parámetros pasados por url "get" (/usuario:id)
    let id = req.params.id;
    //Este trozo de código literalmente borra el registro por id
    //Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

    //Como 2º parámetro del metodo siguiente se puede poner un objeto que contenga
    //los atributos que queremos cambiar

    let cambiaEstado = {
        estado: false
    }
    let options = {
        new: true // hace que al actualizar un campo devuelva en la respuesta el objeto ya actualizado
    }
    Usuario.findByIdAndUpdate(id, cambiaEstado, options, (err, usuarioBorrado) => {


        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        };

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            })
        };

        res.json({
            ok: true,
            usuari: usuarioBorrado
        })

    })
})

//exporto el archivo app de "express" para usarlo en el server
module.exports = app;