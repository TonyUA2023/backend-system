// controllers/documentos.controller.js
import Documento from '../models/documentos.model.js';
import multer from 'multer'; // Importamos Multer

// --- Configuración de Multer (Solo para recibir el archivo en memoria) ---
// Usaremos el almacenamiento en memoria (memoryStorage) porque el archivo
// real se enviará a Google Cloud Storage (GCS) o un servicio similar.
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // Límite de 10MB por archivo
});

// Función de subida a GCS (Simulada por ahora)
// En producción, aquí integrarías el cliente de @google-cloud/storage.
const uploadToGCS = async (file, usuarioId) => {
    // 1. Determinar el nombre del archivo en el bucket (ej: usuarioId/timestamp_nombre.pdf)
    const timestamp = Date.now();
    const gcsFileName = `${usuarioId}/${timestamp}_${file.originalname}`;
    
    // 2. Simulación de la subida a GCS
    // await gcsClient.upload(file.buffer, gcsFileName); 
    
    // 3. Devolver la URL de almacenamiento (la "ruta_almacenamiento" de la DB)
    const ruta_almacenamiento = `gcp://bucket-plagio-ia/${gcsFileName}`;
    console.log(`[SIMULACIÓN GCS] Archivo '${file.originalname}' subido a: ${ruta_almacenamiento}`);

    return { 
        ruta_almacenamiento,
        nombre_archivo: file.originalname,
        tipo_archivo: file.mimetype.split('/')[1] || 'desconocido'
    };
};

// Middleware para manejar la subida de un solo archivo
export const handleFileUpload = upload.single('documento');


// 1. Subir (Crear) un nuevo documento (Endpoint: POST /api/documentos)
export const subirDocumento = async (req, res) => {
    try {
        // Obtenemos el ID del usuario del token JWT (establecido en auth.middleware)
        const usuario_id = req.user.id; 
        
        if (!req.file) {
            return res.status(400).json({ message: 'No se ha adjuntado ningún archivo.' });
        }

        // 1. Simular subida a Google Cloud Storage
        const fileData = await uploadToGCS(req.file, usuario_id);

        // 2. Crear registro en la base de datos
        const nuevoDocumento = await Documento.create(
            usuario_id,
            fileData.nombre_archivo,
            fileData.tipo_archivo,
            fileData.ruta_almacenamiento
        );

        // 3. Respuesta y sugerencia de iniciar análisis
        res.status(201).json({ 
            message: 'Documento subido y registrado con éxito. Estado: pendiente.', 
            documento: nuevoDocumento,
            siguiente_paso: {
                metodo: 'POST',
                url: `/api/analisis/iniciar`,
                body: { documento_id: nuevoDocumento.documento_id }
            }
        });

    } catch (error) {
        console.error('Error al subir documento:', error);
        res.status(500).json({ message: 'Error interno del servidor al procesar el archivo.' });
    }
};


// 2. Obtener un documento por ID (Endpoint: GET /api/documentos/:id)
export const getDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const documento = await Documento.findById(id);

        if (!documento) {
            return res.status(404).json({ message: 'Documento no encontrado.' });
        }

        // Validación de propiedad (solo el dueño o el administrador pueden verlo)
        const esAdmin = req.user.rol === 'administrador';
        const esDuenho = req.user.id === documento.usuario_id;
        
        if (!esAdmin && !esDuenho) {
            return res.status(403).json({ message: 'No tienes permisos para ver este documento.' });
        }

        res.status(200).json(documento);
    } catch (error) {
        console.error('Error al obtener documento:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};


// 3. Cambiar el estado de un documento (Endpoint: PATCH /api/documentos/:id/estado)
export const updateEstadoDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // 'en_proceso', 'completado', 'error', etc.

        if (!estado || !['en_proceso', 'completado', 'error', 'pendiente'].includes(estado)) {
            return res.status(400).json({ message: 'Estado de análisis inválido.' });
        }

        const documentoActualizado = await Documento.updateStatus(id, estado);

        if (!documentoActualizado) {
            return res.status(404).json({ message: 'Documento no encontrado para actualizar.' });
        }

        res.status(200).json({ 
            message: `Estado actualizado a: ${estado}`, 
            documento: documentoActualizado 
        });
    } catch (error) {
        console.error('Error al actualizar estado:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

// 4. Obtener todos los documentos del usuario (Opcional, pero útil)
export const getDocumentosByUsuario = async (req, res) => {
    try {
        const usuario_id = req.user.id; // ID del usuario autenticado
        
        // Asumiendo que Documento.findAllByUserId existe en el modelo
        const documentos = await Documento.findAllByUserId(usuario_id);

        res.status(200).json(documentos);
    } catch (error) {
        console.error('Error al obtener documentos del usuario:', error);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};