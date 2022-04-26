import { Round } from "@prisma/client";
import { prisma } from "..";

export const getAllRounds = async (req: any, res: any) => {
    try {
        const allRounds = await prisma.round.findMany({
            include: {
                contest: true
            }
        });

        res.status(200).json(allRounds);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const createRound = async (req: any, res: any) => {
    try {
        const roundData = req.body;
        const createdRound: Round  = await prisma.round.create({ data: roundData });

        res.status(204).json(createdRound);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const deleteRound = async (req: any, res: any) => {
    try {
        const id = +req.params.id;

        const deletedRound = await prisma.round.delete({ 
            where: {
                id
            }
        });

        res.status(200).json(deletedRound);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const updateRound = async (req: any, res: any) => {
    try {
        const id = +req.params.id;
        const updatedData = req.body;

        const updatedRound = await prisma.round.update({ 
            where: {
                id
            },
            data: updatedData
        });

        res.status(200).json(updatedRound);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};
