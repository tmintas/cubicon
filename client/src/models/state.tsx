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
}

export enum RoundType {
    AVERAGE_OF_5 = 'AVERAGE_OF_5',
    MEAN_OF_3 = 'MEAN_OF_3',
}

export type ContestListState = {
    isLoaded: boolean,
    contests: Contest[],
}