import express, { Express } from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import dotenv from 'dotenv';
import users from './routes/user';
import contests from './routes/contest';
import rounds from './routes/round';
import results from './routes/result';
import { PrismaClient } from '@prisma/client';
import cors from 'cors';

dotenv.config();

export const prisma = new PrismaClient();
export const router = express.Router();
const PORT = process.env.PORT || 3000;


const app: Express = express();

app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors())

app.use('/users', users);
app.use('/contests', contests);
app.use('/rounds', rounds);
app.use('/results', results);

// const corsOptions = {
//     origin: "http://localhost:3001",
//     optionsSuccessStatus: 200,
// }

app.listen(PORT, () => console.log(`Running on ${PORT} ⚡`));
