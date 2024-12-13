import {Markup} from "telegraf";

export const mainMenu = Markup.inlineKeyboard([
    [Markup.button.callback('➕ Add a card to learn', 'ADD_NEW')],
    [Markup.button.callback('📖 Study', 'STUDY_MENU')],
    [Markup.button.callback('⚙️Settings', 'SETTINGS')],
])

export const studyMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: "Learning cards", callback_data: "LEARNING_CARDS"}, {
                text: "Random card",
                callback_data: "RANDOM_CARD"
            }],
            [Markup.button.callback('📑 See all cards', 'ALL_CARDS')],
            [{text: "🔙 Back to main menu", callback_data: "MAIN_MENU"}],
        ],
    },
};

export const learnCardsMenu = () => {
    return {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Next card', callback_data: 'NEXT_CARD'}, {
                    text: '✅ I learned it',
                    callback_data: 'MARK_AS_LEARNED'
                }],
                [{text: '🔧 Card settings', callback_data: 'CARD_SETTINGS'}],
                [{text: 'Back to the study menu 🔙', callback_data: 'STUDY_MENU'}]

            ],
        },
    }
}

export const randomCardMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: 'Back to the study menu 🔙', callback_data: 'STUDY_MENU'}, {
                text: '✅ I learned it',
                callback_data: 'MARK_AS_LEARNED'
            }],
            [{text: '🔧 Card settings', callback_data: 'CARD_SETTINGS'}]

        ],
    },
}

export const addedCardMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: "Add a new card", callback_data: 'ADD_NEW'}, {text: 'Edit this card', callback_data: 'EDIT_CARD'}, {text: 'Delete this card', callback_data: 'DELETE_CARD'}],
            [{text: "🔙 Back to main menu", callback_data: "MAIN_MENU"}],
        ]
    }
}

export const settingsMenu = (isSendingRandomCard: boolean = false) => {
    const text: string = isSendingRandomCard ? '🛑 I don\'t want to get random card daily' : ` 💬 Send me a random card daily`

    return {
        reply_markup: {
            inline_keyboard: [
                [{text: text, callback_data: 'NEXT_CARD'}],
                [ {
                    text: '🕙 Set time for the random card',
                    callback_data: 'SET_RANDOM_CARD_TIME'
                }],
                [{text: "🔙 Back to main menu", callback_data: "MAIN_MENU"}],
            ]
        }
    }
}

export const cardSettingsMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: '✏️ Edit card', callback_data: 'EDIT_CARD'}, {text: '🗑️ Delete card', callback_data: 'DELETE_CARD'}],
        ]
    }
}

export const confirmationMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: '✅ Yes', callback_data: 'YES_DELETE_CARD'}, {text: '🔙 No', callback_data: 'NO_DELETE_CARD'}],
        ]
    }
}

export const backToMenus = {
    reply_markup: {
        inline_keyboard: [
            [{text: "🔙 Back to main menu", callback_data: "MAIN_MENU"}],
            [{text: '🔙 Back to the study menu ', callback_data: 'STUDY_MENU'}]
        ]
    }
}