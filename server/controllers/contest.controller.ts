import { ContestStatus, Round } from "@prisma/client";
import { prisma } from "..";

// TODO handle exceptions, change return type to 500
export const getAllContests = async (req: any, res: any) => {
    try {
        const contests = await prisma.contest.findMany({
            include: {
                organizedBy: true
            }
        });

        res.status(200).json({});
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const createContest = async (req: any, res: any) => {
    try {
        const date = new Date(req.body.date);
        date.setHours(0, 0, 0, 0);

        var createdContest = await prisma.contest.create({
            data: {
                name: req.body.name,
                vkUrl: req.body.vkUrl,
                city: req.body.city,
                date,
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

export const getContest = async (req: any, res: any) => {
    try {
        var id = +req.params.id;

        var contest = await prisma.contest.findFirst({ 
            where: {
                id
            },
            include: {
                rounds: {
                    include: {
                        results: {
                            include: {
                                performedBy: true,
                            }
                        },
                    }
                },
            }
        });

        res.status(200).json(contest);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const updateContest = async (req: any, res: any) => {
    try {
        var id = +req.params.id;
        var data = req.body;

        var updated = await prisma.contest.update({
            where: {
                id
            },
            data: {
                name: data.name,
                vkUrl: data.vkUrl,
                city: data.city,
                date: data.date,
                organizedBy: { connect: { id: data.organizedById } },
                rounds: {
                    deleteMany: {},
                    createMany: {
                        data: data.rounds.map((r: Round) => {
                            return {
                                name: r.name,
                                format: r.format,
                            }
                        }),
                    },
                }
            },
            include: {
                rounds: true,
                organizedBy: true,
            }
        });

        res.status(200).json(updated);
    }
    catch (error: any) {
        console.log(error);
        
        res.status(404).json({ message: error.message });
    }   
};

export const publishContest = async (req: any, res: any) => {
    try {
        const contestId = +req.params.id;
        var updated = await prisma.contest.update({
            where: {
                id: contestId,
            },
            data: {
                status: ContestStatus.PUBLISHED,
            }
        });

        res.status(200).json(updated);
    }
    catch (error: any) {
        console.log(error);
        
        res.status(404).json({ message: error.message });
    }
}