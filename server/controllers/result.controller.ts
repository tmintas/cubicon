import { prisma } from "..";

export const getAllResults = async (req: any, res: any) => {
    try {
        const postMessages = await prisma.result.findMany();

        res.status(200).json(postMessages);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const createResult = async (req: any, res: any) => {
    try {
        const resultData = req.body;
        const createdResult = await prisma.result.create({
            data: resultData
        });

        res.status(204).json(createdResult);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const deleteResult = async (req: any, res: any) => {
    try {
        const id = +req.params.id;

        const deletedResult = await prisma.result.delete({ 
            where: {
                id
            }
        });

        res.status(200).json(deletedResult);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const updateResult = async (req: any, res: any) => {
    try {
        const id = +req.params.id;
        const updatedData = req.body;

        const updatedResult = await prisma.result.update({ 
            where: {
                id
            },
            data: updatedData
        });

        res.status(200).json(updatedResult);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};
