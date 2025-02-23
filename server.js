const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const app = express();

// Configuración de MongoDB
mongoose.connect('mongodb://localhost/login_system', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Modelo de Usuario
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role: String,
    name: String,
    email: String,
    profileImage: String,
    lastLogin: Date
});

const User = mongoose.model('User', userSchema);

// Configuración de Multer para subida de imágenes
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 },
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
}).single('profileImage');

// Verificar tipo de archivo
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Solo se permiten imágenes');
    }
}

app.use(express.json());
app.use(express.static('public'));

// Rutas
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        user.lastLogin = new Date();
        await user.save();

        res.json({
            role: user.role,
            username: user.username,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// Ruta para actualizar imagen de perfil
app.post('/api/upload-profile-image', upload, async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    try {
        const user = await User.findOne({ username: req.body.username });
        user.profileImage = `/uploads/${req.file.filename}`;
        await user.save();
        res.json({ profileImage: user.profileImage });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la imagen de perfil' });
    }
});

// Rutas para el administrador
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find({}, '-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            ...req.body,
            password: hashedPassword
        });
        await user.save();
        res.json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        Object.assign(user, req.body);
        await user.save();
        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});