const express = require('express');

//usamos un método hash de una sola via para que sea imposible reconstruir lo encriptado
const bcrypt = require('bcrypt'); //npm i bcrypt --save

//librería JWT para generar los token
const jwt = require('jsonwebtoken');

const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req, res) => {

    let body = req.body;

    //el método findOne busaca una conincidencia con la condición especificada entre llaves
    // el "email" del Usuario debe ser igual al "body.email"
    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        // evaluo si se ha dado un error en la base de datos
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }
        //evaluo si no se han encontrado coincidencias con el email 
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            })
        }
        //comprobamos si la contraseña no hace match con la de la base de datos
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            })
        }

        //generamos token
        // 3 parámetros (dato a codificar "payload", clave secreta "seed" o "semilla" , tiempo de expiración)
        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
        // hacer que expire en:
        // expiresIn: 60 * 60 *24* 30 -> 30 días
        // expiresIn: 60 * 60 -> 1 hora
        // expiresIn: 60 * 120 -> 2 horas 
        // expiresIn: 60 * 60 *24 1 día
        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        })
    })

});




//exporto el archivo app de "express" para usarlo en el server
module.exports = app;