export type Contest = {
    id: number,
    name: string,
    city: string,
    date: Date,
    vkLink: string,
    location: string,
    isPublished: boolean,
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
    performedById: number,
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

export interface Notification {
    message: string,
}

export type User = {
    id: number,
    firstName: string,
    lastName: string,
}

export interface UserOption {
    displayName: string
    userId: number,
    disabled: boolean,
}

export const ADD_NEW_USER_OPTION_VALUE = 0;

export type ErrorHandlerProps = {
    setNotifications: any,
}
