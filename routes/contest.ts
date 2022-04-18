import express from 'express';
import { getAllContests, createContest, deleteContest, updateContest } from '../controllers/contest.controller';

const router = express.Router();

router.post('/', createContest);
router.get('/', getAllContests);
router.patch('/:id', updateContest)
router.delete('/:id', deleteContest);

export default router;