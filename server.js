const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Login route
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

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        res.json({
            id: user.id,
            role: user.role,
            username: user.username,
            name: user.name,
            carnetNumber: user.carnetNumber,
            career: user.career,
            schedule: user.schedule,
            profileImage: user.profileImage
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// User creation route
app.post('/api/users', async (req, res) => {
    const { username, password, carnetNumber, career, schedule, profileImage } = req.body;
    const role = req.body.role || 'user'; // Default role

    try {
        if (!username || !password || !carnetNumber) {
            return res.status(400).json({ message: 'Datos incompletos (se requieren username, password y carnetNumber)' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                role,
                carnetNumber,
                career: career || "",
                schedule: schedule || "",
                profileImage,
                lastLogin: null
            }
        });

        res.status(201).json({ 
            message: 'Usuario creado exitosamente', 
            user: {
                id: newUser.id,
                username: newUser.username,
                role: newUser.role,
                carnetNumber: newUser.carnetNumber,
                career: newUser.career,
                schedule: newUser.schedule,
                profileImage: newUser.profileImage
            } 
        });
    } catch (error) {
        if (error.code === 'P2002') {
            const target = error.meta.target;
            let message = 'Error de duplicación';
            if (target.includes('username')) message = 'Username ya existe';
            if (target.includes('carnetNumber')) message = 'Número de carnet ya existe';
            return res.status(409).json({ message });
        }
        console.error('User creation error:', error);
        res.status(500).json({ message: 'Error al crear usuario' });
    }
});

// Update user route
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { password, username, role, carnetNumber, career, schedule, profileImage } = req.body;

    try {
        const updateData = {
            username,
            role,
            carnetNumber,
            career,
            schedule,
            profileImage
        };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json({ 
            message: 'Usuario actualizado exitosamente', 
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                role: updatedUser.role,
                carnetNumber: updatedUser.carnetNumber,
                career: updatedUser.career,
                schedule: updatedUser.schedule,
                profileImage: updatedUser.profileImage
            }
        });
    } catch (error) {
        console.error('User update error:', error);
        if (error.code === 'P2002') {
            const target = error.meta.target;
            let message = 'Error de duplicación';
            if (target.includes('username')) message = 'Username ya existe';
            if (target.includes('carnetNumber')) message = 'Número de carnet ya existe';
            return res.status(409).json({ message });
        }
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                carnetNumber: true,
                career: true,
                schedule: true,
                role: true,
                profileImage: true,
                lastLogin: true
            }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});

// Get single user
app.get('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                username: true,
                name: true,
                carnetNumber: true,
                career: true,
                schedule: true,
                role: true,
                profileImage: true,
                lastLogin: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error al obtener usuario' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});