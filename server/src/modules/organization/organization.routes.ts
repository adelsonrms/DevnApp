import { Router } from 'express';
import { organizationController } from './organization.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => organizationController.getAll(req, res));
router.get('/:id', (req, res) => organizationController.getById(req, res));
router.post('/', (req, res) => organizationController.create(req, res));
router.put('/:id', (req, res) => organizationController.update(req, res));
router.delete('/:id', (req, res) => organizationController.delete(req, res));

router.get('/:id/members', (req, res) => organizationController.getMembers(req, res));
router.post('/:id/members', (req, res) => organizationController.addMember(req, res));
router.delete('/:id/members/:userId', (req, res) => organizationController.removeMember(req, res));

export default router;
