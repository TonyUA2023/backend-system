// controllers/analisis.controller.js
import AnalisisReporte from '../models/analisis.model.js';

// Inicia un nuevo análisis para un documento
export const iniciarAnalisis = async (req, res) => {
    try {
        const { documento_id, version_motor_ia = 'v1.0' } = req.body;
        
        if (!documento_id) {
            return res.status(400).json({ message: 'Se requiere el ID del documento.' });
        }

        // Se debería cambiar el estado del documento a 'en_proceso' aquí.

        const analisis = await AnalisisReporte.iniciarAnalisis(documento_id, version_motor_ia);
        res.status(202).json({ message: 'Análisis iniciado.', analisis_id: analisis.analisis_id });
    } catch (error) {
        console.error('Error al iniciar análisis:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Recibe los resultados de un análisis y crea el reporte
export const crearReporte = async (req, res) => {
    try {
        const { analisis_id, porcentaje_similitud_total, resumen_ejecutivo, coincidencias } = req.body;

        if (!analisis_id || porcentaje_similitud_total == null || !resumen_ejecutivo) {
            return res.status(400).json({ message: 'Faltan datos requeridos para el reporte.' });
        }
        
        // Simulación de la inserción de fuentes y coincidencias (ver modelo)
        const reporte = await AnalisisReporte.crearReporte(analisis_id, porcentaje_similitud_total, resumen_ejecutivo, coincidencias);

        // Se debería cambiar el estado del documento a 'completado' aquí.

        res.status(201).json({ message: 'Reporte generado con éxito.', ...reporte });
    } catch (error) {
        console.error('Error al crear reporte:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// Obtener el reporte completo con coincidencias
export const getReporte = async (req, res) => {
    try {
        const { reporte_id } = req.params;
        const reporte = await AnalisisReporte.getReporteCompleto(reporte_id);

        if (!reporte) {
            return res.status(404).json({ message: 'Reporte no encontrado.' });
        }

        res.status(200).json(reporte);
    } catch (error) {
        console.error('Error al obtener reporte:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};