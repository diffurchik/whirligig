import {Telegraf} from 'telegraf';
import {
    updateCardData,
} from './db';
import {ActionSteps, CardStatesType, MyContext, NewPhraseState} from './types'
import {message} from "telegraf/filters";
import {
    backToSettingsMenu,
    editCardMenu,
    mainMenu,
} from "./bot/menus";
import {sendCard} from "./bot/card";
import {loadSchedules, scheduleCard, setRandomCardTime} from "./schedule";
import {escapeMarkdownV2, getCurrentCard} from "./helper";
import {botActions} from "./bot/actions/general-actions";
import {cardActions} from "./bot/actions/card-actions";
import {studyActions} from "./bot/actions/study-actions";
import {botCommands} from "./bot/commands";

// const BOT_TOKEN = '8084776606:AAGDCeqWhkYN7tXcZoDjLy0Eq8W3Ip3Wc0M'; // test
const BOT_TOKEN = '8060710922:AAFVRXNGB7a-NmwTzYEDeWx6pNzUrvSzKXM'; // prod

if (!BOT_TOKEN) {
    throw new Error('Bot token is missing. Please add your bot token.');
}

export const bot = new Telegraf<MyContext>(BOT_TOKEN);
const userActionState: Record<number, Partial<NewPhraseState>> = {}
const cardsState: CardStatesType = {};
botActions(bot, userActionState, cardsState)
cardActions(bot, userActionState, cardsState)
studyActions(bot, cardsState)
botCommands(bot, userActionState, cardsState)

bot.start((ctx) => ctx.reply('Welcome to the bot! Choose an option:', mainMenu
));


bot.on(message('text'), async (ctx) => {
    const userId = ctx.from.id;

    if (!userActionState[userId]) {
        await ctx.reply('Please start by selecting an action.');
        return;
    }

    let state = userActionState[userId]

    if (state.step === ActionSteps.AddEnglishPhrase) {
        userActionState[userId].englishPhrase = ctx.message.text
        userActionState[userId].step = ActionSteps.AddTranslation
        await ctx.reply('Got it 👍 \nNow, please enter the translation for it:', {reply_markup: {force_reply: true}});
        return;
    }

    if (state.step === ActionSteps.AddTranslation) {
        userActionState[userId].translation = ctx.message.text
        await ctx.replyWithMarkdownV2('All set 📌\nClick `"Add examples"` if you want to add examples of use or Click `"Finish"` to save it', {
            reply_markup: {
                inline_keyboard: [
                    [{text: '✍️ Add examples', callback_data: 'EXAMPLES'}, {text: 'Finish 🏁', callback_data: 'FINISH'}]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            },
        });
        return;
    }

    if (state.step === ActionSteps.AddExamples) {
        userActionState[userId].examples = ctx.message.text
        await ctx.replyWithMarkdownV2('All set 📌\n Click `"Finish"` to save it', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Finish 🏁', callback_data: 'FINISH'}],
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            },
        })
        return
    }

    if (state.step === ActionSteps.EditCard) {

    }

    if (state.step === ActionSteps.SetRandomTime) {
        const time = ctx.message.text;

        if (!/^\d{2}:\d{2}$/.test(time)) {
            return ctx.reply("Invalid time format. Please enter time as HH:MM (24-hour).");
        }

        const id = await setRandomCardTime(userId, time, true)

        scheduleCard({
            id: id,
            user_id: ctx.from.id,
            show_random_card: true,
            rand_card_time: time,
            timezone: 'UTC'
        }, ctx, cardsState)
        const message = escapeMarkdownV2(`Got it! I'll send you a random card daily at ${time}`)
        await ctx.replyWithMarkdownV2(message, backToSettingsMenu);
    }

    if (state.step === ActionSteps.EditEnglishPhrase) {
        const newPhrase = ctx.message.text;
        const {cards, currentIndex} = cardsState[userId]
        const card = getCurrentCard(cards, currentIndex)
        const cardId = card.id
        try {
            await updateCardData('english_phrase', newPhrase, userId, cardId);
            cards[currentIndex].english_phrase = newPhrase;
            await sendCard(editCardMenu, ctx, cardsState)
        } catch {
            ctx.reply('Something went wrong', {reply_markup: editCardMenu});
        }

    }

    if (state.step === ActionSteps.EditTranslation) {
        const newTranslation = ctx.message.text;
        const {cards, currentIndex} = cardsState[userId]
        const card = getCurrentCard(cards, currentIndex)
        const cardId = card.id
        try {
            await updateCardData('translate', newTranslation, userId, cardId);
            cards[currentIndex].translate = newTranslation;
            await sendCard(editCardMenu, ctx, cardsState)
        } catch {
            ctx.reply('Something went wrong, please try again', {reply_markup: editCardMenu});
        }
    }

    if (state.step === ActionSteps.EditExamples) {
        const newExamples = ctx.message.text;
        const {cards, currentIndex} = cardsState[userId]
        const card = getCurrentCard(cards, currentIndex)
        const cardId = card.id
        try {
            await updateCardData('examples', newExamples, userId, cardId);
            cards[currentIndex].examples = newExamples;
            await sendCard(editCardMenu, ctx, cardsState)
        } catch {
            ctx.reply('Something went wrong, please try again', {reply_markup: editCardMenu});
        }
    }
})

bot.launch(() => {
    console.log('Bot is running...')
}).catch(error => {
    console.error(error)
});

if (bot) bot.telegram.getMe().then(async (ctx) => {
    await loadSchedules(ctx, cardsState)
})

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));