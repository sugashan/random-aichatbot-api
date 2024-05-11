import express from 'express';
import healthRoutes from './healthCheck/controller.js';

const router = express.Router();

router.use('/', healthRoutes);

export default router;