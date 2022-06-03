import express from 'express';
import { getAllUsers, postUser, deleteUser, updateUser, getUser, getUserContestsCount, getUserResultsAndTotalCount, createManyUsers } from '../controllers/user.controller';

const userRoutes = express.Router();

userRoutes.post('/', postUser);
userRoutes.post('/create-many', createManyUsers);
userRoutes.get('/', getAllUsers);
userRoutes.delete('/:id', deleteUser);
userRoutes.patch('/:id', updateUser)
userRoutes.get('/:id/profile', getUser)
userRoutes.get('/:id/contests-count', getUserContestsCount)
userRoutes.get('/:id/all-results', getUserResultsAndTotalCount)

export default userRoutes;