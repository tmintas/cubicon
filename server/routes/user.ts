import express from 'express';
import { getAllUsers, postUser, deleteUser, updateUser, getUser, getUserContestsCount, getUserResultsAndTotalCount } from '../controllers/user.controller';

const router = express.Router();

router.post('/', postUser);
router.get('/', getAllUsers);
router.delete('/:id', deleteUser);
router.patch('/:id', updateUser)
router.get('/:id/profile', getUser)
router.get('/:id/contests-count', getUserContestsCount)
router.get('/:id/all-results', getUserResultsAndTotalCount)

export default router;