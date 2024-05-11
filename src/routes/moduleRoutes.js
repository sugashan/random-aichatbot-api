import express from 'express';
import swaggerUi from 'swagger-ui-express'
import chatRoutes from './chat/index.js';
import systemRoutes from './system/index.js';
import swaggerSpec from '../config/swagger.js'

const router = express.Router();

router.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

router.use('/api/v1/chat', chatRoutes);

router.use('/system', systemRoutes);

export default router;