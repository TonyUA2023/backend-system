// middleware/auth.middleware.js
import jwt from 'jsonwebtoken';

// Clave secreta (debe coincidir con la usada en auth.controller.js)
const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_CLAVE_SECRETA_DEV'; 

/**
 * Middleware para verificar si un usuario está autenticado (tiene un token JWT válido).
 */
export const verifyToken = (req, res, next) => {
    // 1. Obtener el token del encabezado (Authorization: Bearer <token>)
    const authHeader = req.headers['authorization'];
    
    // Si no hay encabezado, o no tiene el formato 'Bearer <token>'
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Acceso denegado. Token no proporcionado o formato inválido.' });
    }
    
    // 2. Extraer solo el token (quitar 'Bearer ')
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verificar y decodificar el token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 4. Adjuntar la información del usuario al objeto de la solicitud (req)
        // Esto permite a los controladores saber quién está haciendo la petición.
        req.user = {
            id: decoded.id,     // usuario_id
            rol: decoded.rol    // rol_usuario
        };
        
        // Continuar con el siguiente middleware o controlador
        next();
        
    } catch (error) {
        console.error('Error al verificar el token:', error.message);
        return res.status(403).json({ message: 'Token inválido o expirado.' });
    }
};

/**
 * Middleware para verificar roles específicos (ej: solo administradores).
 * @param {string[]} allowedRoles - Array de roles permitidos (ej: ['administrador', 'docente']).
 */
export const restrictTo = (allowedRoles) => (req, res, next) => {
    // La información del usuario (req.user) debe haber sido adjuntada previamente por verifyToken
    if (!req.user || !allowedRoles.includes(req.user.rol)) {
        return res.status(403).json({ message: 'No tienes permiso para realizar esta acción.' });
    }
    next();
};