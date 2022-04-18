import express from 'express';
import { getAllUsers, postUser, deleteUser, updateUser } from '../controllers/user.controller';

const router = express.Router();

router.post('/', postUser);
router.get('/', getAllUsers);
router.delete('/:id', deleteUser);
router.patch('/:id', updateUser)

export default router;