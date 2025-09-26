// models/documentos.model.js
import db from '../config/db.js';

class Documento {
    
    // 📄 1. Crear/Subir Documento
    static async create(usuario_id, nombre_archivo, tipo_archivo, ruta_almacenamiento) {
        const query = `
            INSERT INTO Documentos (usuario_id, nombre_archivo, tipo_archivo, ruta_almacenamiento, estado)
            VALUES ($1, $2, $3, $4, 'pendiente')
            RETURNING *;
        `;
        const { rows } = await db.query(query, [usuario_id, nombre_archivo, tipo_archivo, ruta_almacenamiento]);
        return rows[0];
    }

    // 🔎 2. Obtener Documento por ID
    static async findById(documento_id) {
        const query = 'SELECT * FROM Documentos WHERE documento_id = $1;';
        const { rows } = await db.query(query, [documento_id]);
        return rows[0];
    }
    
    // 🔎 3. Obtener TODOS los Documentos de un Usuario (NUEVO)
    static async findAllByUserId(usuario_id) {
        const query = 'SELECT * FROM Documentos WHERE usuario_id = $1 ORDER BY fecha_subida DESC;';
        const { rows } = await db.query(query, [usuario_id]);
        return rows;
    }

    // 🔄 4. Actualizar el estado (Clave para el motor IA)
    static async updateStatus(documento_id, nuevo_estado) {
        const query = 'UPDATE Documentos SET estado = $1 WHERE documento_id = $2 RETURNING *;';
        const { rows } = await db.query(query, [nuevo_estado, documento_id]);
        return rows[0];
    }

    // 🗑️ 5. Eliminar Documento
    static async delete(documento_id) {
        const query = 'DELETE FROM Documentos WHERE documento_id = $1 RETURNING documento_id;';
        const { rows } = await db.query(query, [documento_id]);
        return rows[0];
    }
}

export default Documento;