export type Contest = {
    id: number,
    name: string,
    city: string,
    date: Date,
    vkLink: string,
    location: string,
    organizedById: any,
    organizedBy: any,
    rounds: Round[],
}

export type Round = {
    id: number,
    name: string,
    type: RoundType,
    results: Result[],
}

export type Result = {
    id: number,
    attempt1: number,
    attempt2: number,
    attempt3: number,
    attempt4: number,
    attempt5: number,
    best: number,
    average: number,
    performedByStr: string,
    roundId: number,
}

export enum RoundType {
    AVERAGE_OF_5 = 'AVERAGE_OF_5',
    MEAN_OF_3 = 'MEAN_OF_3',
}

export type ContestListState = {
    isLoaded: boolean,
    contests: Contest[],
}