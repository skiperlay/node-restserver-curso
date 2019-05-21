//importo el paquete de JWT para el token
const jwt = require('jsonwebtoken')

/*
    el midleware es un paso que se introduce antes de hacer funcionar algo
    en concreto este midleware hace que, antes de devolver el get que se pide
    en "usuario.js" , se entra aquí y se comprueba si el token es válido

    Es importante el uso del parámetro del callback "next" puesto que ejecuta
    el código que se encuentra en la función que contiene el callback que ejecuta
    este middleware.
    Si no se llama a "next" el código que se encuentra en el servicio,por ejemplo, get(/usuario)
    de "usuario.js" mo se ejecutará.
    */

//========================
// Verificar Token
//========================
let verificarToken = (req, res, next) => {

    //al pasar el token mediante los headers la forma de obtener la variable token es:
    //mediante req.get('nombreVariable)
    let token = req.get('token');
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'token no válido'
                }
            })
        }

        //añado a la request "req" la variable "decoded" donde guardo el resultado recibido en el callback
        //para obtenerlo mas tarde en el model como por ejemplo el model "usuario" si fuera necesario
        req.decoded = decoded.usuario;
        next();
    });
};

//========================
// Verificar Admin role
//========================
let verificarAdmin_Role = (req, res, next) => {
    console.log(res);
    let usuario = req.decoded;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
        return;
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'El usuario no es administrador'
            }
        })
    }



};
//========================
// Verificar token para imagen
//========================
/*
Este verificador permite sacar el token del url en vez de desde el header y verificarlo
este es el procedimiento correcto cuando se trata de consultar imagene porque al consultar 
el usuario desde un html y tener que mostrar la imagen en un "img" de html hay que comprobar
el token desde el html, es decir, en el frontend , no pudiendose hacer desde el backend
*/
let verificarTokenImg = (req, res, next) => {
    let token = req.query.token;
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'token no válido'
                }
            })
        }

        //añado a la request "req" la variable "decoded" donde guardo el resultado recibido en el callback
        //para obtenerlo mas tarde en el model como por ejemplo el model "usuario" si fuera necesario
        req.decoded = decoded.usuario;
        next();
    });

};

module.exports = {
    verificarToken,
    verificarAdmin_Role,
    verificarTokenImg
}