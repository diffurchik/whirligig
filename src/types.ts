import {Scenes} from "telegraf";

export interface MyWizardSession extends Scenes.WizardSessionData {
    myWizardSessionProp: number;
    englishPhrase: string
    translation: string
}

export type MyContext = Scenes.WizardContext<MyWizardSession>;
export type actionsSteps =
    'add_english_phrase'
    | 'add_translation'
    | 'add_examples'
    | 'edit_card'
    | 'set_random_time'
    | 'edit_english_phrase'
    | 'edit_translation'
    | 'edit_examples';

export type NewPhraseState = Partial<AddNewPhraseDB> & { step?: actionsSteps };

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

export type UserSchedule = {
    id?: number;
    user_id: number;
    rand_card_time: string;
    show_random_card: boolean;
    timezone: string;
}

