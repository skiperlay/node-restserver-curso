const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// para tener acceso al filesystem mediante node, hay que importar el siguiente paquete
const fs = require('fs');
// también será necesario importar el paquete path para llegar a la carpeta de uploads desde las rutas
const path = require('path');

// default options
app.use(fileUpload({ useTempFiles: true }));
/*
Este middelware se encarga de recoger lo que sea que se está cargando y 
meterlo en el objeto req.files
*/
app.put('/upload/:tipo/:id', function(req, res) {

    let tipo = req.params.tipo;
    let id = req.params.id;

    if (Object.keys(req.files).length == 0) {
        return res.status(400)
            .json({
                ok: false,
                err: {
                    message: 'No se ha seleccionado ningún archivo'
                }
            });
    }

    //valida tipo
    let tiposValidos = ['productos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', ')
            }
        })
    }




    // The name of the input field (i.e. "archivo") is used to retrieve the uploaded file
    let archivo = req.files.archivo;
    //separo el nombre del archivo del nombre de la extensión
    let nombreCortado = archivo.name.split('.');
    //del arreglo generado saco la ultima posición que corresponderá con el nombre de la extensión
    let extension = nombreCortado[nombreCortado.length - 1];

    //extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'PNG', 'JPG', 'GIF', 'JPEG'];

    // si es menor a 0 entonces no está en el arreglo
    if (extensionesValidas.indexOf(extension) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
                ext: extension
            }
        })
    }

    //cambiar nombre al archivo procurando que sea único
    let nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extension}`;

    // Use the mv() method to place the file somewhere on your server
    archivo.mv(`uploads/${tipo}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            })
        if (tipo === 'usuarios')
            imagenUsuario(id, res, nombreArchivo);
        else
            imagenProducto(id, res, nombreArchivo);


        //aquí imagen cargada

    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok: false,
                err
            })
        }
        if (!usuarioDB) {
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no existe'
                }
            })
        }

        borraArchivo(usuarioDB.img, 'usuarios');


        usuarioDB.img = nombreArchivo;
        usuarioDB.save((err, usuarioGuardado) => {
            res.json({
                ok: true,
                usuario: usuarioGuardado,
                img: nombreArchivo
            })
        })
    })
}

function imagenProducto(id, res, nombreArchivo) {

    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            borraArchivo(nombreArchivo, 'productos')
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El producto no existe'
                }
            })
        }
        productoDB.img = nombreArchivo;
        productoDB.save((err, productoGuardado) => {
            res.json({
                ok: true,
                producto: productoDB,
                img: nombreArchivo
            })
        })


    })


}

function borraArchivo(nombreImagen, tipo) {
    /*
            si estamos subiendo de nuevo una imagen para actualizar la imagen de un usuario
            lo primero que hay que hacer es acceder a la imagen de dicho usuario, para ello hacemos
            uso del objeto "path" ,importado arriba, que recoge 2 parámetros, 1º __dirname que especifica
            el lugar donde nos encontramos, 2º ruta a donde queremos acceder desde el 1º parámetro.
            Con esto construimos la ruta que nos lleva a la imagen del usuario que estamos tratando, teniendo
            en cuenta que el nombre de la imagen coincide con el nombre del atributo "img" del objeto "Usuario"
            */
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    //una vez especificada la ruta donde deberia encontrarse la imagen, comprobamos si existe dicha imagen
    if (fs.existsSync(pathImagen)) {
        //si existe la borramos
        fs.unlinkSync(pathImagen);
    }
    /*
    Para buscar la imagen y borrarla hacemos uso de  las funciones "existsSync(pathImagen)" y "unlinkSync(pathImagen)"
    respectivamente
    */
}
module.exports = app;