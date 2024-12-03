import {Markup} from "telegraf";

export const mainMenu = Markup.inlineKeyboard([
    [Markup.button.callback('➕ Add new to learn', 'ADD_NEW')],
    [Markup.button.callback('📖 Study', 'STUDY')],
    [Markup.button.callback('Settings ⚙️', 'SETTINGS')],
])

export const studyMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: "Learning cards", callback_data: "LEARNING_CARDS"}, {
                text: "Random card",
                callback_data: "RANDOM_CARD"
            }],
            [{text: "🔙 Back to main menu", callback_data: "MAIN_MENU"}],
        ],
    },
};

export const learnCardsMenu = (buttonName: string) => {
    return {
        reply_markup: {
            inline_keyboard: [
                [{text: buttonName, callback_data: 'NEXT_CARD'}, {
                    text: '✅ I learned it',
                    callback_data: 'MARK_AS_LEARNED'
                }],

            ],
        },
    }
}

export const randomCardMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: 'Back to menu 🔙', callback_data: 'STUDY_MENU'}, {
                text: '✅ I learned it',
                callback_data: 'MARK_AS_LEARNED'
            }],

        ],
    },
}