const express = require('express');
const fs = require('fs');
//importo paquete path para construir path absolutos
const path = require('path');

const { verificarTokenImg } = require('../middlewares/autenticacion');

let app = express();

app.get('/imagen/:tipo/:img', verificarTokenImg, (req, res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    /*
    Creo un path absoluto gracias al paquete "path" de node apuntando a la imagen
    que corresponda al tipo y nombre correspondiente a los parámetros pasados por url
    */
    let pathImagen = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);

    //comprobar con el paquete "fs" de node usando la función "existsSync" si existe un fichero en la ruta mandada por parámetro
    if (fs.existsSync(pathImagen)) {
        //mandar un fichero,en este caso una imagen, en la respuesta
        res.sendFile(pathImagen)
    } else {
        //path de la imagen de no-imagen
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg')
            //devuelve cualquier archivo con el encabezado html correspondiente mediante un path absoluto
        res.sendFile(noImagePath);
    }


});





module.exports = app;