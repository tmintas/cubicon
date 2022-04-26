import { prisma } from "..";

export const getAllContests = async (req: any, res: any) => {
    try {
        const contests = await prisma.contest.findMany({
            include: {
                organizedBy: true
            }
        });

        console.log(contests);
        res.status(200).json(contests);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const createContest = async (req: any, res: any) => {
    try {
        var createdContest = await prisma.contest.create({
            data: {
                name: req.body.name,
                vkUrl: req.body.vkUrl,
                city: req.body.city,
                date: req.body.date,
                organizedBy: { connect: { id: req.body.organizedById } },
                rounds: { create: req.body.rounds },
            },
            include: {
                rounds: true,
                organizedBy: true,
            }
        });

        res.status(201).json(createdContest);
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
