export type Contest = {
    id: number,
    name: string,
    city: string,
    date: Date,
    vkLink: string,
    location: string,
    status: ContestStatus,
    organizedById: any,
    organizedBy: any,
    rounds: Round[],
}

export enum ContestStatus {
    NEW = 'NEW',
    EDITING_RESULTS = 'EDITING_RESULTS',
    PUBLISHED = 'PUBLISHED',
}

export type Round = {
    id: number,
    name: string,
    format: RoundFormat,
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
    performedBy: User,
    roundId: number,
}

export enum RoundFormat {
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

export const USER_OPTIONS_NEW_USER_VALUE = 0;
export const USER_OPTIONS_MIN_SYMBOLS_VALUE = -1;
export const USER_OPTIONS_LOADING_VALUE = -2;
export const USER_OPTIONS_INVALID_INPUT_VALUE = -3;

export class UserOption {

    constructor(
        public userId: number,
        public disabled: boolean, 
        public firstName?: string,
        public lastName?: string,
        public manuallyCreated?: boolean,
    ) {}

    get displayName(): string {
        if (this.userId === USER_OPTIONS_LOADING_VALUE) {
            return 'Загрузка...';
        }
        if (this.userId === USER_OPTIONS_MIN_SYMBOLS_VALUE) {
            return 'Введите мин. 3 символа';
        }
        if (this.userId === USER_OPTIONS_NEW_USER_VALUE && !this.manuallyCreated) {
            return `Создать участника: ${this.firstName} ${this.lastName}`;
        }
        if (this.userId === USER_OPTIONS_INVALID_INPUT_VALUE) {
            return `Введите имя в формате 'Иван Иванов'`;
        }

        return `${this.firstName} ${this.lastName}`;
    } 
}

export const ADD_NEW_USER_OPTION_VALUE = 0;

export type ErrorHandlerProps = {
    setNotifications: any,
}
