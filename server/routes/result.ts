import express from 'express';
import { getAllResults, updateResults, deleteResult, updateResult } from '../controllers/result.controller';

const router = express.Router();

router.put('/:id', updateResults);
router.get('/', getAllResults);
router.delete('/:id', deleteResult);
router.patch('/:id', updateResult)

export default router;