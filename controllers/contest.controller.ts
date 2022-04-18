import { prisma } from "..";

export const getAllContests = async (req: any, res: any) => {
    try {
        const postMessages = await prisma.contest.findMany();

        res.status(200).json(postMessages);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const createContest = async (req: any, res: any) => {
    try {
        const contestData = req.body;

        var createdContest = await prisma.contest.create({
            data: contestData
        });

        res.status(204).json(createdContest);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const deleteContest = async (req: any, res: any) => {
    try {
        var id = +req.params.id;

        var deletedContest = await prisma.contest.delete({ 
            where: {
                id
            }
        });

        res.status(200).json(deletedContest);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const updateContest = async (req: any, res: any) => {
    try {
        var id = +req.params.id;
        var updatedData = req.body;

        var updatedContest = await prisma.contest.update({ 
            where: {
                id
            },
            data: updatedData
        });

        res.status(200).json(updatedContest);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};
