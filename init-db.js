const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user'); // Asegúrate de tener el modelo de usuario definido

mongoose.connect('mongodb://localhost/login_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function initializeDatabase() {
    try {
        // Limpiar la base de datos
        await User.deleteMany({});

        // Crear usuarios iniciales
        const users = [
            {
                username: 'usuario1',
                password: await bcrypt.hash('pass123', 10),
                role: 'user',
                name: 'Usuario Uno',
                email: 'usuario1@example.com',
                profileImage: '/uploads/default-profile.png'
            },
            {
                username: 'usuario2',
                password: await bcrypt.hash('pass456', 10),
                role: 'user',
                name: 'Usuario Dos',
                email: 'usuario2@example.com',
                profileImage: '/uploads/default-profile.png'
            },
            {
                username: 'admin',
                password: await bcrypt.hash('admin123', 10),
                role: 'admin',
                name: 'Administrador',
                email: 'admin@example.com',
                profileImage: '/uploads/default-profile.png'
            }
        ];

        await User.insertMany(users);
        console.log('Base de datos inicializada con éxito');
        process.exit(0);
    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        process.exit(1);
    }
}

initializeDatabase();