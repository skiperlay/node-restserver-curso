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

    //al pasar el token mediante los headers la forma de obetener la variable token es:
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

module.exports = {
    verificarToken,
    verificarAdmin_Role
}