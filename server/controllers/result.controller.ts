import { ContestStatus, Result, User } from "@prisma/client";
import { prisma } from "..";

const DNF = -1;
const DNS = -2;

// stores additional user information for creation of new users
type ResultUIItem = Result & {
    performedBy: User,
}

export const getAllResults = async (req: any, res: any) => {
    try {
        const results: Result[] = await prisma.result.findMany();

        res.status(200).json(results);
    }
    catch (error: any) {
        res.status(404).json({ message: error.message });
    }   
};

export const updateResults = async (req: any, res: any) => {
    const contestId = +req.params.id;

    try {
        const results: ResultUIItem[] = req.body;
        const contestRounds = await prisma.round.findMany({
            where: {
                contestId,
            },
        });

        // check if all rounds have results
        if (!contestRounds.every(r => results.find(res => res.roundId === r.id))) {
            res.status(400).json({ message: 'results for some of the contest rounds are not provided'});

            return;
        }

        // check results validity
        if (results.some(r => !isAttemptValid(r.attempt1) || !isAttemptValid(r.attempt2) ||
                              !isAttemptValid(r.attempt3) || !isAttemptValid(r.attempt4) || !isAttemptValid(r.attempt5))) {
            res.status(400).json({ message: 'some of the results has an empty or negative value'});

            return;
        }

        // validate best and average
        for (let r of results) {
            const attempts = [ r.attempt1, r.attempt2, r.attempt3, r.attempt4, r.attempt5 ];

            const calculatedBest = calculateBest(attempts);

            if (calculatedBest !== r.best) {
                res.status(400).json({ message: 'best is incorrect'});

                return;
            }
    
            if (calculateAvg(attempts) !== r.average) {
                res.status(400).json({ message: 'average is incorrect'});

                return;
            }
        }

        // validate and update contest
        const validationErrorMessage = await validateContest(contestId);
        if (validationErrorMessage) {
            res.status(400).json({ message: validationErrorMessage });

            return;
        }

        await prisma.contest.update({
            where: {
                id: contestId,
            },
            data: {
                status: ContestStatus.EDITING_RESULTS,
            },
        })

        // delete previous values - new ones will be populated from the form value
        await prisma.result.deleteMany({
            where: {
                roundId: {
                    in: contestRounds.map(r => r.id),
                }
            }
        })

        const createdUsers = await createNewUsers(results);

        const creationResult = await prisma.result.createMany({
            data: results.map(r => {
                const performedBy = r.performedBy;
                const createdUser = createdUsers.find(u => u.firstName === performedBy.firstName && u.lastName === performedBy.lastName);

                // get id from existing users meaning that the result was entered for an existing user
                // or from created user - result was entered for a new user
                const performedById = performedBy.id || createdUser?.id || 0;
                
                return {
                    attempt1: r.attempt1,
                    attempt2: r.attempt2,
                    attempt3: r.attempt3,
                    attempt4: r.attempt4,
                    attempt5: r.attempt5,
                    best: r.best,
                    average: r.average,
                    roundId: r.roundId,
                    performedById: performedById,
                }
            }),
            skipDuplicates: true,
        });

        res.status(204).json(creationResult);
    }
    catch (error: any) {
        console.log(error);
        
        res.status(500).json({ message: error.message });
        res.end();

        return;
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

        const updatedResult: Result = await prisma.result.update({ 
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

const isAttemptValid = (attemptValueMs: number) => {
    if (attemptValueMs === DNF || attemptValueMs === DNS) return true;

    return attemptValueMs > 0;
}

const createNewUsers = async (results: ResultUIItem[]) => {
    const usersToBeCreated = results.filter(r => !r.performedBy.id).map(r => {
        return {
            firstName: r.performedBy.firstName,
            lastName: r.performedBy.lastName,
        }
    });
    
    await prisma.user.createMany({
        data: usersToBeCreated
    });

    const createdUsers = await prisma.user.findMany({
        where: {
            OR: usersToBeCreated
        }
    });

    return createdUsers;
}

const calculateBest = (attempts: number[]) => {
    return attempts.every(a => a === DNF || a === DNS) 
        ? attempts[0]
        : attempts.filter(a => a !== DNF && a !== DNS).sort((a, b) => a - b)[0];
}

const calculateAvg = (attempts: number[]) => {
    const withoutBest: number[] = attempts.filter((_, i) => i !== attempts.indexOf(calculateBest(attempts)));
    const firstDNForDNS = withoutBest.find(a => a === DNF || a === DNS);
    const worst = firstDNForDNS ? firstDNForDNS : withoutBest.reduce((prev, cur) => cur > prev ? cur : prev, withoutBest[0]);
    const withoutBestAndWorst: number[] = withoutBest.filter((_, i) => i !== withoutBest.indexOf(worst));

    return Math.floor(withoutBestAndWorst.reduce((prev, cur) => prev + cur, 0) / 3);
}

const validateContest = async (contestId: number) => {
    const contest = await prisma.contest.findFirst({
        where: {
            id: contestId,
        }
    });

    if (contest === null) {
        return `contest with id ${contestId} was not found!`;
    }

    if (contest.status === ContestStatus.PUBLISHED) {
        return `you cannot edit a published contest!`;
    }
}