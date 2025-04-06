import {CardStatesType, MyContext} from "../../types";
import {Context, Telegraf} from "telegraf";
import {backToMenus, learningCardsMenu, optionsToLearnMenu, randomCardMenu} from "../menus";
import {sendCardViaContext, sendCardAndDeletePreviousMessage} from "../card";
import {
    getUnlearnedCardsByUserId,
    getRandomCardByUserId,
    markedCardAsLearned,
    getNumberOfCardsByUserId
} from "../../db";
import {getUserData} from "../../helper";

export const studyActions = (bot: Telegraf<MyContext>, cardsState: CardStatesType) => {

    bot.action('RANDOM_CARD', async (ctx) => {
        const userId = ctx.from.id;
        const card = await getRandomCardByUserId(userId)
        if (card) {
            cardsState[userId] = {cards: [card], currentIndex: 0, cardType: 'random'};
            await sendCardViaContext(randomCardMenu, cardsState, ctx);
        } else {
            ctx.reply('There is not cards to study \n Click "Add new" to start education');
        }
    })

    bot.action('LEARNING_CARDS', async (ctx: Context) => {
        await ctx.editMessageText('Learning menu', {reply_markup: optionsToLearnMenu})
    })

    bot.action('LEARN_ALL', async (ctx) => {
            const userId = ctx.from.id;
            const cards = await getUnlearnedCardsByUserId(ctx.from.id)
            if (Array.isArray(cards) && cards.length) {
                cardsState[userId] = {cards, currentIndex: 0, cardType: 'learning'};
                await sendCardAndDeletePreviousMessage(ctx, userId, cardsState);
                cardsState[userId].currentIndex++
            } else {
                ctx.reply('There are not cards to study \n Click "Add new" to start education');
            }
        }
    );

    bot.action('NEXT_CARD', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (userId) {
            const userCardsByUser = cardsState[userId]
            if (!userCardsByUser) {
                await ctx.reply('No Card found', backToMenus);
                return
            }


            if (userCardsByUser.currentIndex < userCardsByUser.cards.length) {
                const sentMessage = await sendCardViaContext(learningCardsMenu, cardsState, ctx);
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
                await ctx.editMessageText('You’ve reached the end of the cards 🎉 Great job!', backToMenus);
                delete cardsState[userId];
            }
        }
    })

    bot.action('MARK_AS_LEARNED', async (ctx: Context) => {
        const { userId } = getUserData(ctx)
        try {
            if (userId) {
                const {cards, currentIndex} = cardsState[userId]
                const id = cards[currentIndex].id
                await markedCardAsLearned(id)
                await ctx.reply('Congrats with new phrase in your vocab 🚀 This phrase will be skipped the next time');
            }
        } catch (error) {
            console.error('Error marking card as learned:', error);
        }
    })

    bot.action('LEARN_10', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (userId) {
            const cards = await getNumberOfCardsByUserId(userId, 10)
            if (Array.isArray(cards) && cards.length) {
                cardsState[userId] = {cards, currentIndex: 0, cardType: 'learning'};
                await sendCardAndDeletePreviousMessage(ctx, userId, cardsState);
                cardsState[userId].currentIndex++
            } else {
                await ctx.reply('There are not cards to study \n Click "Add new" to start education');
            }
        }
    })
}