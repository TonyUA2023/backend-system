// controllers/usuarios.controller.js
import Usuario from '../models/usuarios.model.js';

// Controlador para obtener todos los usuarios
export const getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Controlador para crear un usuario
export const createUsuario = async (req, res) => {
    try {
        const { nombre_completo, correo_electronico, contrasena, rol } = req.body;
        
        // **IMPORTANTE**: En producción, aquí harías el hasheo de 'contrasena'
        const contrasena_hash = contrasena; // Solo para el ejemplo simple

        // Simple validación básica (debes mejorar esto)
        if (!nombre_completo || !correo_electronico || !contrasena || !rol) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        const nuevoUsuario = await Usuario.create(nombre_completo, correo_electronico, contrasena_hash, rol);
        res.status(201).json(nuevoUsuario);

    } catch (error) {
        if (error.code === '23505') { // Código de error de duplicado en PostgreSQL (UNIQUE constraint)
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }
        console.error('Error al crear usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};