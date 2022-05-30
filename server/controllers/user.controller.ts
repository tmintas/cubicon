import { prisma } from "..";
import { getAllResults } from "./result.controller";

export const getAllUsers = async (req: any, res: any) => {
    try {
        const users = await prisma.user.findMany();

        res.status(200).json(users);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const postUser = async (req: any, res: any) => {
    try {
        const userData = req.body;
        const createdUser = await prisma.user.create({
            data: userData
        });

        res.status(201).json(createdUser);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const deleteUser = async (req: any, res: any) => {
    try {
        const id = +req.params.id;

        const deletedUser = await prisma.user.delete({ 
            where: {
                id
            }
        });

        res.status(200).json(deletedUser);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const updateUser = async (req: any, res: any) => {
    try {
        const id = +req.params.id;
        const updatedData = req.body;

        const updatedUser = await prisma.user.update({ 
            where: {
                id
            },
            data: updatedData
        });

        res.status(200).json(updatedUser);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const getUser = async (req: any, res: any) => {
    try {
        const userId = +req.params.id;

        const user = await prisma.user.findFirst({
            where: {
                id: userId,
            }
        });

        res.status(200).json(user);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    } 
}

export const getUserContestsCount = async (req: any, res: any) => {
    try {
        const userId = +req.params.id;

        const contestsCount = await prisma.contest.count({
            where: {
                rounds: {
                    some: {
                        results: { some: { performedById: userId } }
                    }
                },
            }
        });

        res.status(200).json(contestsCount);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    } 
}

export const getUserResultsAndTotalCount = async (req: any, res: any) => {
    try {
        const userId = +req.params.id;

        const userResults = await prisma.result.findMany({
            where: {
                performedById: userId,
            },
            include: {
                round: {
                    include: {
                        contest: true,
                    }
                }
            },
        });

        const totalSolvesCount = userResults.reduce((prev, next) => {
            [ next.attempt1, next.attempt2, next.attempt3, next.attempt4, next.attempt5 ].forEach(a => {
                if (a !== -1 && a !== -2) {
                    prev++;
                }
            })

            return prev;
        }, 0);

        res.status(200).json({
            totalSolvesCount,
            allResults: userResults.map(s => {
                return {
                    id: s.id,
                    contestId: s.round.contestId,
                    contestName: s.round.contest.name,
                    roundName: s.round.name,
                    best: s.best,
                    average: s.average,
                    attempt1: s.attempt1,
                    attempt2: s.attempt2,
                    attempt3: s.attempt3,
                    attempt4: s.attempt4,
                    attempt5: s.attempt5,
                }
            }),
        });
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    } 
}
