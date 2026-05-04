import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.post('/forgot-password', (req, res) => userController.forgotPassword(req, res));
router.post('/reset-password', (req, res) => userController.resetPassword(req, res));

router.use(authenticate);

router.get('/', (req, res) => userController.getAll(req, res));
router.get('/:id', (req, res) => userController.getById(req, res));
router.post('/', (req, res) => userController.create(req, res));
router.put('/:id', (req, res) => userController.update(req, res));
router.delete('/:id', (req, res) => userController.delete(req, res));

router.post('/:id/change-password', (req, res) => userController.changePassword(req, res));

export default router;
