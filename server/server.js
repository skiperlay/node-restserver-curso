require('./config/congif');

//paquete express para crear el servicio rest
const express = require('express'); //npm install express --save
//paquete mongoose para establecer la conexión con mongodb
const mongoose = require('mongoose'); //npm install mongoose --save

//Obtengo el path de la raiz que lo trae node por defecto
const path = require('path');

const app = express();

//body-parser para parsear la información que va por post
const bodyParser = require('body-parser') // npm install body-parser --save

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//habilitar la carpeta public
app.use(express.static(path.resolve(__dirname, '../public')));
//el objeto path tiene un método "resolve" que obtiene los 2 parámetros , los procesa y devulve el path correcto ( no se bien como funciona pero funciona)

//importo y uso las rutas
app.use(require('./routes/index'));


//conectamos con la base de datos de mongodb
//let cadenaConexionLocal = 'mongodb://localhost:27017/cafe';
//let cadenaConexionCloud = 'mongodb+srv://skiperlay:fm1P6VpFYVPRcMf3@cafe-odf7e.mongodb.net/cafe';

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true },
    (err, res) => {
        if (err) {
            throw err;
        } else {
            console.log('Base de datos ONLINE');
        }
    });

app.listen(process.env.PORT, () => {
    console.log('Escuchando puerto', process.env.PORT);
})