import {Scenes} from "telegraf";


export interface UserData {
    userId?: number
    username?: string
}

export interface MyWizardSession extends Scenes.WizardSessionData {
    myWizardSessionProp: number;
    englishPhrase: string
    translation: string
}

export type MyContext = Scenes.WizardContext<MyWizardSession>;

export enum ActionSteps {
    AddEnglishPhrase = 'add_english_phrase',
    AddTranslation = 'add_translation',
    AddExamples = 'add_examples',
    EditCard = 'edit_card',
    SetRandomTime = 'set_random_time',
    EditEnglishPhrase = 'edit_english_phrase',
    EditTranslation = 'edit_translation',
    EditExamples = 'edit_examples',
    SetReminderTime = 'set_reminder_time',
}

export type NewPhraseState = Partial<AddNewPhraseDB> & { step?: ActionSteps };

export type CardType = 'random' | 'learning'

export interface Message {
    message: string;
    created_at: string;
}

export interface NewPhrase {
    englishPhrase: string;
    translation: string;
    examples?: string
}

export interface AddNewPhraseDB extends NewPhrase {
    id: number;
    username: string;
}

export type Card = {
    id: number;
    english_phrase: string;
    translate: string;
    examples?: string
    learned: boolean
}

export type UserScheduleType = {
    id?: number;
    user_id: number;
    rand_card_time: string;
    show_random_card: boolean;
    timezone: string;
    reminder_time: string;
    send_reminder: boolean;
}

export type CardStatesType = Record<number, {
    cards: Card[];
    currentIndex: number,
    lastMessageId?: number,
    cardType?: CardType
}>

export type UserStatesType = Record<number, Partial<NewPhraseState>>

