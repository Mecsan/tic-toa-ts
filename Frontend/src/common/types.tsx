export type Choice = 'X' | 'O' | '';

export type board = [Choice, Choice, Choice, Choice, Choice, Choice, Choice, Choice, Choice];

export interface player {
    name: string,
    choice: Choice,
    isOnline: boolean,
}

export class Player implements player {
    name: string;
    choice: Choice;
    isOnline: boolean;
    constructor(name: string, choice: Choice) {
        this.name = name;
        this.choice = choice;
        this.isOnline = true;
    }
}