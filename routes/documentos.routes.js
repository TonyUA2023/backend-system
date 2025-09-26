// routes/documentos.routes.js
import { Router } from 'express';
import { subirDocumento, getDocumento, updateEstadoDocumento } from '../controllers/documentos.controller.js';
import { verifyToken, restrictTo } from '../middleware/auth.middleware.js'; // <-- Importar middleware

const router = Router();

// Todas estas rutas requieren un token válido
router.use(verifyToken); // Aplica verifyToken a todas las rutas debajo

// POST /api/documentos (Solo docentes y administradores suben)
router.post('/', restrictTo(['docente', 'administrador']), subirDocumento); 

// GET /api/documentos/:id
router.get('/:id', getDocumento); 

// PATCH /api/documentos/:id/estado (Solo la IA o el admin deberían cambiar esto)
router.patch('/:id/estado', restrictTo(['administrador']), updateEstadoDocumento);

export default router;