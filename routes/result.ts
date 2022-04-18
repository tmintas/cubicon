import express from 'express';
import { getAllResults, createResult, deleteResult, updateResult } from '../controllers/result.controller';

const router = express.Router();

router.post('/', createResult);
router.get('/', getAllResults);
router.delete('/:id', deleteResult);
router.patch('/:id', updateResult)

export default router;