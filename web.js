const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
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

app.get('/pages/adminSearch/search.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'adminSearch', 'search.html'));
});


app.get('*', (req, res) => {
    res.redirect('/pages/index/index.html');
});

// Iniciar el servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Pagina ejecutándose en el puerto ${PORT}`);
});