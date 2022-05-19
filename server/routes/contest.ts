import express from 'express';
import { getAllContests, createContest, deleteContest, updateContest, getContest } from '../controllers/contest.controller';

const router = express.Router();

// TODO create separate middleware file
router.use((req, res, next) => {
    let errorMessage: string = '';

    if (req.method === 'POST' || req.method === 'PUT') {
        if (!req.body.name) errorMessage = 'name should not be empty';
        if (!req.body.organizedById) errorMessage = 'organizer should not be empty';
        if (!req.body.date) errorMessage = 'date should not be empty';

        if (!!errorMessage) {
            res.status(400).json({ message: 'organizer should not be empty'});
            return;
        }
    }

    next();
})

router.post('/', createContest);
router.get('/', getAllContests);
router.get('/:id', getContest);
router.put('/:id', updateContest)
router.delete('/:id', deleteContest);

export default router;