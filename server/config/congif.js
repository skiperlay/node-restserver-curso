// =============================
// Puerto
// =============================

//el process es un objeto global que se ejecuta en toda la app node
//de ese objeto se saca el puerto
process.env.PORT = process.env.PORT || 3000;

// =============================
// Entorno
// =============================

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// =============================
// Base de datos
// =============================

let urlDB;

if (process.env.NODE_ENV === 'dev') {
    urlDB = 'mongodb://localhost:27017/cafe';
} else {
    /*
    -para crear una variable de entorno en heroku:
        heroku config set:MONGO_URI ="mongodb+srv://skiperlay:fm1P6VpFYVPRcMf3@cafe-odf7e.mongodb.net/cafe"
        siento "MONGO_URI" el nombre de la variable que estamos creando
    -para ver las variables de entorno de heroku:
        heroku config
    -para ver el valor de la variable de entorno "MONGO_URI" de heroku:
        heroku config:get nombre
    -para borrar la variable creada "MONGO_URI" en heroku:
        heroku config:unset MONGO_URI
    */
    urlDB = process.env.MONGO_URI;
    //urlDB = 'mongodb+srv://skiperlay:fm1P6VpFYVPRcMf3@cafe-odf7e.mongodb.net/cafe';
}

process.env.URLDB = urlDB;