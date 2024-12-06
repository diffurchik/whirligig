import {Telegraf} from 'telegraf';
import {
    deleteCardFromDB,
    getNotLearnedPhrasesByUserName,
    getRandomCardByUserId,
    insertPhrase,
    markedPhraseAsLearned, setRandomCardTime
} from './db';
import {AddNewPhraseDB, Card, MyContext, NewPhraseState} from './types'
import {message} from "telegraf/filters";
import {
    backToMenus,
    cardSettingsMenu,
    confirmationMenu,
    learnCardsMenu,
    mainMenu,
    randomCardMenu,
    settingsMenu,
    studyMenu
} from "./menu-actions";
import {formattedText, sendCard, sendCardAndDeletePreviousMessage} from "./card";
import cron from 'node-cron';

const BOT_TOKEN = '8060710922:AAFVRXNGB7a-NmwTzYEDeWx6pNzUrvSzKXM';

if (!BOT_TOKEN) {
    throw new Error('Bot token is missing. Please add your bot token.');
}

export const bot = new Telegraf<MyContext>(BOT_TOKEN);
const userActionState: Record<number, Partial<NewPhraseState>> = {}
const cardsState: Record<number, { cards: Card[]; currentIndex: number, lastMessageId?: number }> = {};
const userSchedules: Record<number, { time: string }> = {};

bot.start((ctx) => ctx.reply('Welcome to the bot! Choose an option:', mainMenu
));

bot.action('ADD_NEW', async (ctx) => {

    const userId = ctx.from.id;
    const username = ctx.from.username;
    userActionState[userId] = {username: username, step: 'add_english_phrase'};
    await ctx.reply('Please, enter the English phrase you want to learn', {reply_markup: {force_reply: true}})
})

bot.action('STUDY_MENU', async (ctx) => {
    await ctx.editMessageText("Choose an option from the Study menu:", studyMenu)
})


bot.action('MAIN_MENU', async (ctx) => {
    await ctx.editMessageText("You are in the main menu Choose an option:", mainMenu)
})

bot.action('SETTINGS', async (ctx) => {
    await ctx.editMessageText("Your current settings is", settingsMenu())
})

bot.action('EXAMPLES', async (ctx) => {
    const userId = ctx.from.id;
    const {englishPhrase} = userActionState[userId];
    await ctx.reply(`Enter example how to use ${englishPhrase}`, {reply_markup: {force_reply: true}});
    userActionState[userId].step = 'add_examples'
})

bot.action("FINISH", async (ctx) => {

    const userId = ctx.from.id;
    const {username, englishPhrase, translation, examples} = userActionState[userId];
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
    delete userActionState[userId];
})

bot.action('RANDOM_CARD', async (ctx) => {
    await ctx.reply("You random cards is 👇")
    const userId = ctx.from.id;
    const card = await getRandomCardByUserId(userId)
    if (card) {
        cardsState[userId] = {cards: [card], currentIndex: 0};
        await sendCard(randomCardMenu, ctx, userId, cardsState);
    } else {
        ctx.reply('There is not cards to study \n Click "Add new" to start education');
    }
})

bot.action('LEARNING_CARDS', async (ctx) => {
        const userId = ctx.from.id;
        const cards = await getNotLearnedPhrasesByUserName(ctx.from.id!)
        if (Array.isArray(cards) && cards.length) {
            cardsState[userId] = {cards, currentIndex: 0};
            await sendCardAndDeletePreviousMessage(ctx, userId, cardsState);
            cardsState[userId].currentIndex++
        } else {
            ctx.reply('There is not cards to study \n Click "Add new" to start education');
        }
    }
)

bot.action('NEXT_CARD', async (ctx) => {
    const userId = ctx.from.id;
    const userCardsByUser = cardsState[userId]
    if (!userCardsByUser) {
        ctx.reply('No Card found');
        return
    }


    if (userCardsByUser.currentIndex < userCardsByUser.cards.length ) {
        const sentMessage = await sendCard(learnCardsMenu(), ctx, userId, cardsState);
        if (userCardsByUser.lastMessageId) {
            try {
                await ctx.deleteMessage(userCardsByUser.lastMessageId);
            } catch (error) {
                console.error('Error deleting previous message:', error);
            }
        }
        userCardsByUser.currentIndex++

        cardsState[userId].lastMessageId = sentMessage.message_id;
    } else {
        await ctx.editMessageText('You’ve reached the end of the cards 🎉 Great job! ');
        delete cardsState[userId];
    }
})

bot.action('MARK_AS_LEARNED', async (ctx) => {
    const userId = ctx.from.id;
    const {cards, currentIndex} = cardsState[userId]
    const id = cards[currentIndex].id
    await markedPhraseAsLearned(id)
    ctx.reply('Congrats with new phrase in your vocab 🚀 This phrase will be skipped the next time');
})

bot.action('EDIT_CARD', async (ctx) => {
    const userId = ctx.from.id;
    const {cards, currentIndex} = cardsState[userId]
    const id = cards[currentIndex].id

    userActionState[userId].step = 'edit_card'
    // ctx.editMessageText('Enter')
})

bot.action('SET_RANDOM_CARD_TIME', async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username;
    await ctx.editMessageText("At what time (HH:MM, 24-hour format) should I send you a random card daily?")
    userActionState[userId] = {username: username, step: 'set_random_time'};
})

bot.action('CARD_SETTINGS', async (ctx) => {
     ctx.reply('Choose an option from the card settings menu', cardSettingsMenu)
})

bot.action('DELETE_CARD', async (ctx) => {
    ctx.editMessageText('Are you sure you want to delete this card?', confirmationMenu)
})

bot.action('YES_DELETE_CARD', async (ctx) => {
    const userId = ctx.from.id;
    const {cards, currentIndex} = cardsState[userId]
    const cardId = cards[currentIndex].id
    const resultDeleting = await deleteCardFromDB(userId.toString(), cardId);
    if(resultDeleting) {
        ctx.editMessageText('Card was deleted successfully.', backToMenus);
    } else {
        ctx.editMessageText('Something went wrong. Try again', confirmationMenu)
    }
})


bot.on(message('text'), async (ctx) => {
    const userId = ctx.from.id;

    if (!userActionState[userId]) {
        await ctx.reply('Please start by selecting an action.');
        return;
    }

    let state = userActionState[userId]

    if (state.step === 'add_english_phrase') {
        userActionState[userId].englishPhrase = ctx.message.text;
        userActionState[userId].step = 'add_translation'
        await ctx.reply('Got it 👍 \nNow, please enter the translation for it:', {reply_markup: {force_reply: true}});
        return;
    }

    if (state.step === 'add_translation') {
        userActionState[userId].translation = ctx.message.text;
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
        userActionState[userId].examples = ctx.message.text;
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

    if(state.step === 'edit_card') {

    }

    if(state.step === 'set_random_time') {
        const time = ctx.message.text;

        if (!/^\d{2}:\d{2}$/.test(time)) {
            return ctx.reply("Invalid time format. Please enter time as HH:MM (24-hour).");
        }

        userSchedules[userId] = { time };
        await setRandomCardTime((userId).toString(), time, true)

        ctx.reply(`Got it! I'll send you a random card daily at ${time}.`);

        cron.schedule(`0 ${time.split(':')[1]} ${time.split(':')[0]} * * *`, async () => {
            const randomCard = await getRandomCardByUserId(ctx.from.id!);
            if (randomCard) {
                await ctx.replyWithMarkdownV2("✨ *Scheduled Card* ✨")
                cardsState[userId] = {cards: [randomCard], currentIndex: 0};
                await sendCard(randomCardMenu, ctx, userId, cardsState);
            } else {
                ctx.reply('There is not cards to study \n Click "Add new" to start education');
            }
        })
    }
})

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