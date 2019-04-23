//importo la libreria de mongodb
const mongoose = require('mongoose'); //npm install mongoose --save


//esto sirve para especificar valores unicos mediante la propiedad unique de un atributo del objeto
const uniqueValidator = require('mongoose-unique-validator'); //npm i mongoose-unique-validator --save

let rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol válido'
}

//creamos un esquema del objeto de mongoose
let Schema = mongoose.Schema;

//declaramos un esquema de usuario (es el esquema de datos que tendrán los usuarios en la base de datos)
let usuarioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'El correo es necesario']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    img: {
        type: String,
        required: false
    },
    role: {
        type: String,
        default: 'USER_ROLE',
        enum: rolesValidos
    },
    estado: {
        type: Boolean,
        default: true
    },
    google: {
        type: Boolean,
        default: false

    }
});

//haciendo lo siguiente eliminamos la contraseña de la respuesta 
usuarioSchema.methods.toJSON = function() {

    let user = this;
    let usuerObject = user.toObject();
    delete usuerObject.password;

    return usuerObject;
}

// esto sirve para que no se puedan introducir emails iguales mas de 1 vez
usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' })

//exporto este MODELO de datos para usarlo en otros ficheros del proyecto
module.exports = mongoose.model('Usuario', usuarioSchema);