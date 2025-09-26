// routes/usuarios.routes.js
import { Router } from 'express';
import { getAllUsuarios, createUsuario } from '../controllers/usuarios.controller.js';

const router = Router();

// GET /api/usuarios - Obtiene todos los usuarios
router.get('/', getAllUsuarios);

// POST /api/usuarios - Crea un nuevo usuario
router.post('/', createUsuario);

export default router;