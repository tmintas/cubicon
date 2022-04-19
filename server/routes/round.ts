import express from 'express';
import { getAllRounds, createRound, deleteRound, updateRound } from '../controllers/round.controller';

const router = express.Router();

router.post('/', createRound);
router.get('/', getAllRounds);
router.delete('/:id', deleteRound);
router.patch('/:id', updateRound)

export default router;