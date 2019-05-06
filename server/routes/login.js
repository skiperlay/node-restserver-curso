const express = require('express');

//usamos un método hash de una sola via para que sea imposible reconstruir lo encriptado
const bcrypt = require('bcrypt'); //npm i bcrypt --save

//librería JWT para generar los token
const jwt = require('jsonwebtoken');

//configuración de la librería de google para descifrar el token que envía google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);


const Usuario = require('../models/usuario');

const app = express();

//servicio para hacer login en la aplicación
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

//Función sacada de la documentación de google developer para validar el token de usuario que se recibe de google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}

/* 
servicio post llamado desde "index.html" en la carpeta "public" 
este servicio recoge el token que manda google con toda la información del usuario
el cual envia una función que se encuentra en el index.html

hay que instalar una librería de google que valida el token que recibimos de google:
npm install google-auth-library --save
Esta libreria contiene la función asíncrona "verifyIdToken()" del objeto client  que se encuentra justo arriba
dentro de la función que he creado llamada verify(token)
*/
app.post('/google', async(req, res) => {

    //sacamos el "idToken" de la petición post que recibimos del "html" 
    let token = req.body.idtoken;

    //antes de nada verifico si el token es correcto
    let googleUser = await verify(token)
        .catch(e => {
            //si no es correcto entro en "catch" y mando error 403
            res.status(403).json({
                ok: false,
                err: e
            })
        });
    //si es correcto el token buscamos si tenemos en la base de datos el email que recibimos del token
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        //si hay un error al buscar en la base de datos sacamos error 500
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        //si encontramos que tenemos el email que recibimos del token, registrado en la BD entonces:
        if (usuarioDB) {
            // si ese email no esta guardado como email de google mandamos la siguiente respuesta
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autentificación normal'
                    }
                })
            } else {
                //Si el email si lo tenemos como procedente de google entonces generamos token y enviamos
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token,
                })
            }
        } else {
            //Si el usuario(email) procedente del token no existe en nuestra base de datos entonces lo creamos
            let usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    })
                };

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })

            })

        }
    })
});




//exporto el archivo app de "express" para usarlo en el server
module.exports = app;