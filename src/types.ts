import {Scenes} from "telegraf";

export interface MyWizardSession extends Scenes.WizardSessionData {
    myWizardSessionProp: number;
    englishPhrase: string
    translation: string
}

export type MyContext = Scenes.WizardContext<MyWizardSession>;
export type AddPhraseStep = 'add_english_phrase' | 'add_translation' | 'add_examples';

export type UserStateEntry = Partial<AddNewPhraseDB> & { step?: AddPhraseStep };

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
}

