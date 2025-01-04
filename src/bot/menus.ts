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

export const learningCardsMenu = {
        inline_keyboard: [
            [{text: '➡️ Next card', callback_data: 'NEXT_CARD'}, {
                text: '✅ I learned it',
                callback_data: 'MARK_AS_LEARNED'
            }],
            [{text: '🔧 Card settings', callback_data: 'CARD_SETTINGS'}],
            [{text: 'Back to the study menu 🔙', callback_data: 'STUDY_MENU'}]

        ],
}

export const randomCardMenu = {
        inline_keyboard: [
            [{text: 'Back to the study menu 🔙', callback_data: 'STUDY_MENU'}, {
                text: '✅ I learned it',
                callback_data: 'MARK_AS_LEARNED'
            }],
            [{text: '🔧 Card settings', callback_data: 'CARD_SETTINGS'}]

        ],
}

export const addedCardMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: "Add a new card", callback_data: 'ADD_NEW'}, {
                text: 'Edit this card',
                callback_data: 'EDIT_CARD'
            }, {text: 'Delete this card', callback_data: 'DELETE_CARD'}],
            [{text: "🔙 Back to main menu", callback_data: "MAIN_MENU"}],
        ]
    }
}

export const settingsMenu = (isSendingRandomCard: boolean = false, isSendingReminder: boolean = false) => {
    const textSendRandomCard: string = isSendingRandomCard ? '🛑 I don\'t want to get random card daily' : ` 🤓 Send me a random card daily`
    const textSendReminder: string = isSendingReminder? 'I don\'t want to get reminder' : '🤓 Send me a study reminder daily'

    return {
        reply_markup: {
            inline_keyboard: [
                [{text: textSendRandomCard, callback_data: 'SET_SENDING_RANDOM_CARD'}],
                [{text: textSendReminder, callback_data: 'SET_SENDING_REMINDER'}],
                [{
                    text: '🕙 Set time for the random card',
                    callback_data: 'SET_RANDOM_CARD_TIME'
                }],
                [{
                    text: '🕙 Set time for the study reminder',
                    callback_data: 'SET_REMINDER_TIME'
                }],,
                [{text: "🔙 Back to main menu", callback_data: "MAIN_MENU"}],
            ]
        }
    }
}

export const cardSettingsMenu = {
    inline_keyboard: [
        [{text: '✏️ Edit card', callback_data: 'EDIT_CARD'}, {text: '🗑️ Delete card', callback_data: 'DELETE_CARD'}],
        [{text: '🔙 Back to the card menu ', callback_data: 'CARD_MENU'}]
    ]

}

export const confirmationMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: '✅ Yes', callback_data: 'YES_DELETE_CARD'}, {text: '🔙 No', callback_data: 'BACK_TO_CARD'}],
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

export const backToSettingsMenu = {
    reply_markup: {
        inline_keyboard: [
            [{text: '🔙  Back to settings menu', callback_data: 'SETTINGS'}],
        ]
    }
}

export const editCardMenu = {
    inline_keyboard: [
        [{text: 'Edit English phrase', callback_data: 'EDIT_ENGLISH_PHRASE'}],
        [{text: 'Edit translation', callback_data: 'EDIT_TRANSLATION'}],
        [{text: 'Edit example', callback_data: 'EDIT_EXAMPLE'}],
        [{text: '🔙 Back to card', callback_data: 'BACK_TO_CARD'}],
    ]
}

export const optionsToLearnMenu = {
    inline_keyboard: [
        [{text: 'Learn all unlearned cards', callback_data: 'LEARN_ALL'}, {text: 'Learn 10 random cards', callback_data: 'LEARN_10'}],
        [{text: '🔙 Back to the study menu ', callback_data: 'STUDY_MENU'}]
    ]
}
