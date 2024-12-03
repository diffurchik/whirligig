import {Markup, Telegraf} from 'telegraf';
import {
    getNotLearnedPhrasesByUserName,
    getRandomPhraseByUserId,
    insertPhrase,
    markedPhraseAsLearned
} from './db';
import {AddNewPhraseDB, Card, MyContext, UserStateEntry} from './types'
import {message} from "telegraf/filters";
import {learnCardsMenu, mainMenu, randomCardMenu, studyMenu} from "./menu";
import {formattedText, sendCard} from "./card";

const BOT_TOKEN = '8060710922:AAFVRXNGB7a-NmwTzYEDeWx6pNzUrvSzKXM';

if (!BOT_TOKEN) {
    throw new Error('Bot token is missing. Please add your bot token.');
}

const bot = new Telegraf<MyContext>(BOT_TOKEN);
const userState: Record<number, Partial<UserStateEntry>> = {}
const userCardState: Record<number, { cards: Card[]; currentIndex: number, lastMessageId?: number }> = {};

bot.start((ctx) => ctx.reply('Welcome to the bot! Choose an option:', mainMenu
));

// bot.telegram.setMyCommands([
//     {command: 'add', description: 'add new to learn'},
//     {command: 'study', description: 'learn english phrase'},
//     {command: 'settings', description: 'update your preferences'},
// ])


bot.action('ADD_NEW', async (ctx) => {

    const userId = ctx.from.id;
    const username = ctx.from.username;
    userState[userId] = {username: username, step: 'add_english_phrase'};
    await ctx.reply('Please, enter the English phrase you want to learn', {reply_markup: {force_reply: true}})
})

bot.action('STUDY_MENU', async (ctx) => {
    await ctx.editMessageText("Choose an option from the Study menu:", studyMenu)
})

bot.action('EXAMPLES', async (ctx) => {
    const userId = ctx.from.id;
    const {englishPhrase} = userState[userId];
    await ctx.reply(`Enter example how to use ${englishPhrase}`, {reply_markup: {force_reply: true}});
    userState[userId].step = 'add_examples'
})


bot.on(message('text'), async (ctx) => {
    const userId = ctx.from.id;

    if (!userState[userId]) {
        await ctx.reply('Please start by selecting an action.');
        return;
    }

    let state = userState[userId]

    if (state.step === 'add_english_phrase') {
        userState[userId].englishPhrase = ctx.message.text;
        userState[userId].step = 'add_translation'
        await ctx.reply('Got it 👍 \nNow, please enter the translation for it:', {reply_markup: {force_reply: true}});
        return;
    }

    if (state.step === 'add_translation') {
        userState[userId].translation = ctx.message.text;
        await ctx.replyWithMarkdownV2('All set 📌\nClick `"Add examples"` if you want to add examples of use or Click `"Finish"` to save it', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Add examples', callback_data: 'EXAMPLES'}, {text: 'Finish 🏁', callback_data: 'FINISH'}]
                ],
                resize_keyboard: true,
                one_time_keyboard: true
            },
        });
        return;
    }

    if (state.step === 'add_examples') {
        userState[userId].examples = ctx.message.text;
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
})

bot.action("FINISH", async (ctx) => {

    const userId = ctx.from.id;
    const {username, englishPhrase, translation, examples} = userState[userId];
    if (englishPhrase && translation && username) {
        putDataInBD({id: userId, username, englishPhrase, translation, examples});
    }
    const formattedCard = formattedText({english_phrase: englishPhrase, translate: translation, examples: examples})

    try {
        await ctx.reply(`Your phrase and translation have been saved! 🎉 \n Your new card is 👇`)
        await ctx.replyWithMarkdownV2(`📝 New card:${formattedCard}`)
    } catch (error) {
        ctx.reply('something went wrong. Please, check your phrase and try again 🔄');
    }
    delete userState[userId];
})

bot.action("STUDY", async (ctx) => {
    ctx.editMessageText("Choose the option from study menu", studyMenu)
})

bot.action('RANDOM_CARD', async (ctx) => {
    await ctx.reply("You random cards is 👇")
    const userId = ctx.from.id;
    const card = await getRandomPhraseByUserId(userId)
    if (card) {
        userCardState[userId] = {cards: [card], currentIndex: 0};
        await sendCard(randomCardMenu, ctx, userId, userCardState);
    } else {
        ctx.reply('There is not cards to study \n Click "Add new" to start education');
    }
})
bot.action('LEARNING_CARDS', async (ctx) => {
        const userId = ctx.from.id;
        const cards = await getNotLearnedPhrasesByUserName(ctx.from.id!)
        if (Array.isArray(cards) && cards.length) {
            userCardState[userId] = {cards, currentIndex: 0};
            await sendCardAndDeletePreviousMessage(ctx, userId);
        } else {
            ctx.reply('There is not cards to study \n Click "Add new" to start education');
        }
    }
)

bot.action('NEXT_CARD', async (ctx) => {
    const userId = ctx.from.id;
    const userCardsByUser = userCardState[userId]
    if (!userCardsByUser) {
        ctx.reply('No Card found');
        return
    }

    userCardsByUser.currentIndex++

    if (userCardsByUser.currentIndex < userCardsByUser.cards.length) {
        await sendCardAndDeletePreviousMessage(ctx, userId);
    } else {
        await ctx.reply('You’ve reached the end of the cards\\. Great job! 🎉');
        delete userCardState[userId];
    }
})

bot.action('MARK_AS_LEARNED', async (ctx) => {
    const userId = ctx.from.id;
    const {cards, currentIndex} = userCardState[userId]
    const id = cards[currentIndex].id
    await markedPhraseAsLearned(id)
    ctx.reply('Congrats with new phrase in your vocab 🚀 This phrase will be skipped the next time');
})

async function sendCardAndDeletePreviousMessage(ctx: any, userId: number) {
    const {cards, currentIndex, lastMessageId} = userCardState[userId];

    const buttonName = currentIndex === cards.length ? 'Last card' : 'Next card'

    const sentMessage = await sendCard(learnCardsMenu(buttonName), ctx, userId, userCardState)

    if (lastMessageId) {
        try {
            await ctx.deleteMessage(lastMessageId);
        } catch (error) {
            console.error('Error deleting previous message:', error);
        }
    }

    userCardState[userId].lastMessageId = sentMessage.message_id;
}

function putDataInBD(dbTransactionMessage: AddNewPhraseDB) {
    insertPhrase(dbTransactionMessage.id,
        dbTransactionMessage.username,
        dbTransactionMessage.englishPhrase,
        dbTransactionMessage.translation,
        dbTransactionMessage.examples)
        .catch(error => {
            throw new Error()
        });
}

bot.launch().then(() => console.log('Bot is running...'));


process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));