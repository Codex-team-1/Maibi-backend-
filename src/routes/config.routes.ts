import { Router } from 'express';
import { getConfig } from '../controllers/config.controller.js';

export const configRoutes = Router();

configRoutes.get('/', getConfig);
