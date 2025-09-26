// models/usuarios.model.js
import db from '../config/db.js';

class Usuario {
    // Obtener todos los usuarios
    static async findAll() {
        const query = 'SELECT usuario_id, nombre_completo, correo_electronico, rol, fecha_creacion FROM Usuarios';
        const { rows } = await db.query(query);
        return rows;
    }

    // Crear un nuevo usuario (Aquí usarías una librería para hashear la contraseña como bcrypt)
    // Por simplicidad, omitimos el hasheo, pero es CRÍTICO en producción.
    static async create(nombre_completo, correo_electronico, contrasena_hash, rol) {
        const query = `
            INSERT INTO Usuarios (nombre_completo, correo_electronico, contrasena_hash, rol)
            VALUES ($1, $2, $3, $4)
            RETURNING usuario_id, nombre_completo, correo_electronico, rol
        `;
        const { rows } = await db.query(query, [nombre_completo, correo_electronico, contrasena_hash, rol]);
        return rows[0];
    }
    
    // Aquí irían más métodos como findById, update, delete, etc.
}

export default Usuario;