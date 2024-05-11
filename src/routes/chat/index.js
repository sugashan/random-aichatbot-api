import express from 'express';
import apiV1Routes from './api/v1/controller.js';


const router = express.Router();

router.use('/', apiV1Routes)

export default router;