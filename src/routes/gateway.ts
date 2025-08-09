import { Router } from 'express';
import { GatewayController } from '../controllers/gatewayController';

const router = Router();
const gatewayController = new GatewayController();

// list available routes
router.get('/routes', gatewayController.getRoutes.bind(gatewayController));

// catch-all for request proxying
router.all('*', gatewayController.proxyRequest.bind(gatewayController));

export default router;
