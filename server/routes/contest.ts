import express from 'express';
import { getAllContests, createContest, deleteContest, updateContest, getContest } from '../controllers/contest.controller';

const router = express.Router();

router.post('/', createContest);
router.get('/', getAllContests);
router.get('/:id', getContest);
router.put('/:id', updateContest)
router.delete('/:id', deleteContest);

export default router;