const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json()); // <-- Añadir esto
app.use(express.urlencoded({ extended: true })); // <-- Añadir esto
app.use(express.static(path.join(__dirname, 'public')));

app.get('/pages/index/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index', 'index.html'));
});

app.get('/pages/profile/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'profile', 'profile.html'));
});

app.get('/pages/admin/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin', 'admin.html'));
});

app.get('*', (req, res) => {
    res.redirect('/pages/index/index.html');
});


// Configuración de Multer para subir imágenes
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

// Ruta de login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // Actualizar fecha de último login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

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
        const user = await prisma.user.findUnique({ where: { username: req.body.username } });
        const profileImagePath = `/uploads/${req.file.filename}`;

        const updatedUser = await prisma.user.update({
            where: { username: req.body.username },
            data: { profileImage: profileImagePath }
        });

        res.json({ profileImage: updatedUser.profileImage });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la imagen de perfil' });
    }
});

// Ruta para obtener todos los usuarios (solo administrador)
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, name: true, email: true, role: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});

// Ruta para crear un nuevo usuario
app.post('/api/users', async (req, res) => {
    const { username, password, role, name, email } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
                name,
                email,
                lastLogin: new Date()
            }
        });

        res.json({ message: 'Usuario creado exitosamente', user: newUser });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear usuario' });
    }
});

// Ruta para actualizar un usuario
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { password, username, role, name, email } = req.body;

    try {
        const updatedData = {
            username,
            role,
            name,
            email
        };

        if (password) {
            updatedData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updatedData
        });

        res.json({ message: 'Usuario actualizado exitosamente', user: updatedUser });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
});

// Ruta para eliminar un usuario
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await prisma.user.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
