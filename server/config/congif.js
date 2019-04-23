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
    urlDB = 'mongodb+srv://skiperlay:fm1P6VpFYVPRcMf3@cafe-odf7e.mongodb.net/cafe';
}

process.env.URLDB = urlDB;