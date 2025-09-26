// controllers/auth.controller.js
import AuthModel from '../models/auth.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Clave secreta para firmar los JWT (¡Debe estar en .env en producción!)
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_CLAVE_SECRETA_DEV'; 

/**
 * Registra un nuevo usuario.
 */
export const register = async (req, res) => {
    try {
        const { nombre_completo, correo_electronico, contrasena, rol } = req.body;
        
        // 1. Validaciones básicas
        if (!nombre_completo || !correo_electronico || !contrasena || !rol) {
            return res.status(400).json({ message: 'Faltan campos obligatorios.' });
        }

        // 2. Verificar si el usuario ya existe
        const existingUser = await AuthModel.findByEmail(correo_electronico);
        if (existingUser) {
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
        }

        // 3. Registrar usuario (la lógica de hasheo está en el modelo)
        const newUser = await AuthModel.register(nombre_completo, correo_electronico, contrasena, rol);

        // 4. Generar Token para iniciar sesión inmediatamente
        const token = jwt.sign(
            { id: newUser.usuario_id, rol: newUser.rol }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.status(201).json({ 
            message: 'Registro exitoso.', 
            token,
            user: { id: newUser.usuario_id, nombre: newUser.nombre_completo, rol: newUser.rol }
        });

    } catch (error) {
        console.error('Error en el registro:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el registro.' });
    }
};


/**
 * Permite al usuario iniciar sesión.
 */
export const login = async (req, res) => {
    try {
        const { correo_electronico, contrasena } = req.body;

        // 1. Validar datos
        if (!correo_electronico || !contrasena) {
            return res.status(400).json({ message: 'Se requieren correo y contraseña.' });
        }

        // 2. Buscar usuario
        const user = await AuthModel.findByEmail(correo_electronico);
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 3. Comparar contraseñas
        const isMatch = await bcrypt.compare(contrasena, user.contrasena_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        // 4. Generar Token JWT
        const token = jwt.sign(
            { id: user.usuario_id, rol: user.rol }, 
            JWT_SECRET, 
            { expiresIn: '1d' } // Expira en 1 día
        );

        // 5. Respuesta exitosa
        res.status(200).json({
            message: 'Inicio de sesión exitoso.',
            token,
            user: { id: user.usuario_id, nombre: user.nombre_completo, rol: user.rol }
        });

    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el login.' });
    }
};