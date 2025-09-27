// server.js
import express from 'express';
import 'dotenv/config'; 
import db from './config/db.js'; 

// 1. Importar Rutas existentes
import userRoutes from './routes/usuarios.routes.js'; 
// 2. Importar nuevas Rutas
import documentosRoutes from './routes/documentos.routes.js';
import analisisRoutes from './routes/analisis.routes.js';
import authRoutes from './routes/auth.routes.js'; // <-- Nuevo



const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json()); 

// Conexión a la base de datos (Ejemplo: verifica si el pool está vivo)
db.connect()
    .then(() => console.log('Conexión a PostgreSQL establecida con éxito.'))
    .catch(err => console.error('Error al conectar con PostgreSQL:', err.stack));

// Rutas de prueba inicial
app.get('/', (req, res) => {
    res.send('API de Análisis de Documentos con IA y PostgreSQL.');
});

// Uso de Rutas
app.use('/api/auth', authRoutes); // <-- Nuevo: Rutas de autenticación
app.use('/api/usuarios', userRoutes);
app.use('/api/documentos', documentosRoutes); // Agregamos la ruta de documentos
app.use('/api/analisis', analisisRoutes); // Agregamos la ruta de análisis y reportes

// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});