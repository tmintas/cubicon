import { prisma } from "..";

export const getAllUsers = async (req: any, res: any) => {
    try {
        const postMessages = await prisma.user.findMany();

        res.status(200).json(postMessages);
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

        res.status(204).json(createdUser);
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
