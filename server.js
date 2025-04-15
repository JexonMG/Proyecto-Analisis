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
    const { carnetNumber, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { carnetNumber } });
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
            hours: user.hours,
            profileImage: user.profileImage
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// User creation route
app.post('/api/users', async (req, res) => {
    const { username, password, carnetNumber, career, schedule, hours, profileImage, lastLogin, tutor, areaTrabajo } = req.body;
    const role = req.body.role || 'user';
    
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
                hours: hours || 0,
                profileImage,
                lastLogin,
                tutor: tutor || "",
                areaTrabajo: areaTrabajo || ""
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
                hours: newUser.hours,
                profileImage: newUser.profileImage,
                lastLogin: newUser.lastLogin,
                tutor: newUser.tutor,
                areaTrabajo: newUser.areaTrabajo
            } 
        });
    } catch (error) {
        console.error('Error creating user:', error);
        if (error.code === 'P2002') {
            res.status(400).json({ message: 'El número de carnet ya está registrado' });
        } else {
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }
});

// Update user route
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { password, username, role, carnetNumber, career, schedule, hours, profileImage, tutor, areaTrabajo } = req.body;

    try {
        const updateData = {};
        
        // Only add fields that are provided in the request
        if (username !== undefined) updateData.username = username;
        if (role !== undefined) updateData.role = role;
        if (carnetNumber !== undefined) updateData.carnetNumber = carnetNumber;
        if (career !== undefined) updateData.career = career;
        if (schedule !== undefined) updateData.schedule = schedule;
        if (hours !== undefined) updateData.hours = hours;
        if (profileImage !== undefined) updateData.profileImage = profileImage;
        if (tutor !== undefined) updateData.tutor = tutor;
        if (areaTrabajo !== undefined) updateData.areaTrabajo = areaTrabajo;

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
                hours: updatedUser.hours,
                profileImage: updatedUser.profileImage,
                tutor: updatedUser.tutor,
                areaTrabajo: updatedUser.areaTrabajo
            }
        });
    } catch (error) {
        console.error('Error updating user:', error);
        if (error.code === 'P2025') {
            res.status(404).json({ message: 'Usuario no encontrado' });
        } else if (error.code === 'P2002') {
            res.status(400).json({ message: 'El número de carnet ya está registrado' });
        } else {
            res.status(500).json({ message: 'Error en el servidor' });
        }
    }
});

// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                carnetNumber: true,
                career: true,
                schedule: true,
                hours: true,
                role: true,
                lastLogin: true,
                tutor: true,
                areaTrabajo: true
            }
        });
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

// User search
app.get('/api/users/search', async (req, res) => {
    const { username, limit } = req.query;
    
    try {
        const takeClause = limit ? { take: parseInt(limit) } : {};
        
        const allUsers = await prisma.user.findMany({
            ...takeClause,
            select: {
                id: true,
                username: true,
                carnetNumber: true,
                career: true,
                schedule: true,
                hours: true,
                role: true,
                lastLogin: true,
                profileImage: true,
                tutor: true,
                areaTrabajo: true
            },
            orderBy: {
                username: 'asc'
            }
        });
        
        let filteredUsers = allUsers;
        
        if (username) {
            const searchTerm = username.toLowerCase();
            filteredUsers = allUsers.filter(user => 
                user.username.toLowerCase().includes(searchTerm)
            );
        }
        
        res.json(filteredUsers);
    } catch (error) {
        console.error('Error searching users:', error);
        res.status(500).json({ message: 'Error en el servidor' });
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
                carnetNumber: true,
                career: true,
                schedule: true,
                hours: true,
                role: true,
                profileImage: true,
                lastLogin: true,
                tutor: true,
                areaTrabajo: true
            }
        });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});