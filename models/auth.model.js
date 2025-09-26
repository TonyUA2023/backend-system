// models/auth.model.js
import db from '../config/db.js';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10; // Nivel de seguridad del hasheo

class AuthModel {
    /**
     * Busca un usuario por su correo electrónico.
     */
    static async findByEmail(correo_electronico) {
        const query = 'SELECT usuario_id, nombre_completo, correo_electronico, contrasena_hash, rol FROM Usuarios WHERE correo_electronico = $1;';
        const { rows } = await db.query(query, [correo_electronico]);
        return rows[0];
    }

    /**
     * Registra un nuevo usuario en la base de datos, hasheando la contraseña.
     */
    static async register(nombre_completo, correo_electronico, contrasena, rol) {
        // 1. Hashear la contraseña
        const contrasena_hash = await bcrypt.hash(contrasena, SALT_ROUNDS);

        // 2. Insertar en la DB
        const query = `
            INSERT INTO Usuarios (nombre_completo, correo_electronico, contrasena_hash, rol)
            VALUES ($1, $2, $3, $4)
            RETURNING usuario_id, nombre_completo, correo_electronico, rol, fecha_creacion;
        `;
        const { rows } = await db.query(query, [nombre_completo, correo_electronico, contrasena_hash, rol]);
        return rows[0];
    }
}

export default AuthModel;