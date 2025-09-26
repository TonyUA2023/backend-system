// models/analisis.model.js
import db from '../config/db.js';

class AnalisisReporte {

    // 🧠 1. Iniciar un análisis (Crea la entrada en la tabla Analisis)
    static async iniciarAnalisis(documento_id, version_motor_ia) {
        const query = `
            INSERT INTO Analisis (documento_id, fecha_inicio, version_motor_ia)
            VALUES ($1, NOW(), $2)
            RETURNING *;
        `;
        const { rows } = await db.query(query, [documento_id, version_motor_ia]);
        return rows[0];
    }

    // ✅ 2. Finalizar Análisis y crear Reporte
    static async crearReporte(analisis_id, porcentaje_similitud_total, resumen_ejecutivo, coincidencias = []) {
        // En una app real, usarías una transacción para asegurar ambas inserciones

        // 2a. Actualizar Analisis (fecha_fin)
        await db.query('UPDATE Analisis SET fecha_fin = NOW() WHERE analisis_id = $1;', [analisis_id]);

        // 2b. Crear Reporte
        const reporteQuery = `
            INSERT INTO Reportes (analisis_id, porcentaje_similitud_total, resumen_ejecutivo)
            VALUES ($1, $2, $3)
            RETURNING reporte_id;
        `;
        const { rows: reporteRows } = await db.query(reporteQuery, [analisis_id, porcentaje_similitud_total, resumen_ejecutivo]);
        const reporte_id = reporteRows[0].reporte_id;

        // 2c. Insertar Coincidencias (simplificado)
        // Esta parte asume que 'coincidencias' es un array de objetos con los datos necesarios.
        for (const c of coincidencias) {
            // Nota: Aquí deberías verificar y/o crear las Fuentes primero
            // Por simplicidad, solo insertaremos una coincidencia básica asumiendo fuente_id existe
            const coincidenciaQuery = `
                INSERT INTO Coincidencias (reporte_id, fuente_id, texto_original_fragmento, texto_fuente_fragmento, porcentaje_similitud_fragmento)
                VALUES ($1, $2, $3, $4, $5);
            `;
            await db.query(coincidenciaQuery, [
                reporte_id,
                c.fuente_id || 1, // Usar un ID 1 por defecto para el ejemplo
                c.texto_original_fragmento,
                c.texto_fuente_fragmento,
                c.porcentaje_similitud_fragmento
            ]);
        }

        return { reporte_id, analisis_id };
    }

    // 📋 3. Obtener Reporte Completo
    static async getReporteCompleto(reporte_id) {
        const query = `
            SELECT 
                r.reporte_id, 
                r.porcentaje_similitud_total, 
                r.resumen_ejecutivo,
                a.fecha_inicio,
                a.fecha_fin,
                a.version_motor_ia,
                (
                    SELECT json_agg(json_build_object(
                        'fragmento_original', c.texto_original_fragmento,
                        'similitud', c.porcentaje_similitud_fragmento,
                        'fuente_url', f.url_identificador,
                        'fuente_titulo', f.titulo_fuente
                    ))
                    FROM Coincidencias c
                    JOIN Fuentes f ON c.fuente_id = f.fuente_id
                    WHERE c.reporte_id = r.reporte_id
                ) AS coincidencias
            FROM Reportes r
            JOIN Analisis a ON r.analisis_id = a.analisis_id
            WHERE r.reporte_id = $1;
        `;
        const { rows } = await db.query(query, [reporte_id]);
        return rows[0];
    }
}

export default AnalisisReporte;