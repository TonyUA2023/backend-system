// routes/analisis.routes.js
import { Router } from 'express';
import { iniciarAnalisis, crearReporte, getReporte } from '../controllers/analisis.controller.js';
import { verifyToken, restrictTo } from '../middleware/auth.middleware.js'; // <-- Importar middleware

const router = Router();

// Todas estas rutas requieren un token válido
router.use(verifyToken); // Aplica verifyToken a todas las rutas debajo

// POST /api/analisis/iniciar (Docentes/Admin inician, o un servicio de cola)
router.post('/iniciar', restrictTo(['docente', 'administrador']), iniciarAnalisis); 

// POST /api/analisis/reporte (Solo el motor de IA/Admin debería llamar esto)
router.post('/reporte', restrictTo(['administrador']), crearReporte); 

// GET /api/analisis/reporte/:reporte_id
router.get('/reporte/:reporte_id', getReporte); 

export default router;