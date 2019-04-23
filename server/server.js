require('./config/congif');

//paquete express para crear el servicio rest
const express = require('express'); //npm install express --save
//paquete mongoose para establecer la conexión con mongodb
const mongoose = require('mongoose'); //npm install mongoose --save

const app = express();

//body-parser para parsear la información que va por post
const bodyParser = require('body-parser') // npm install body-parser --save

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//importo y uso la ruta del usuario
app.use(require('./routes/usuario'));


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