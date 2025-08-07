import { Router } from 'express';
import { HealthController } from '../controllers/healthController';

const router = Router();
const healthController = new HealthController();

// general health check
router.get('/', healthController.getHealth.bind(healthController));

// health check for a specific service
router.get('/:service', healthController.getServiceHealth.bind(healthController));

// list of available services
router.get('/services/list', healthController.getServicesList.bind(healthController));

export default router;
