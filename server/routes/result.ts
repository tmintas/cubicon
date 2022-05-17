import express from 'express';
import { getAllResults, createResults, deleteResult, updateResult } from '../controllers/result.controller';

const router = express.Router();

router.post('/', createResults);
router.get('/', getAllResults);
router.delete('/:id', deleteResult);
router.patch('/:id', updateResult)

export default router;