import {ActionSteps, CardStatesType, MyContext, UserStatesType} from "../../types";
import {Context, Telegraf} from "telegraf";
import {
    backToMenus,
    cardSettingsMenu,
    confirmationMenu,
    editCardMenu,
    learningCardsMenu,
    mainMenu,
    randomCardMenu
} from "../menus";
import {deleteCardFromDB} from "../../db";
import {escapeMarkdownV2, getCurrentCard, getUserData} from "../../helper";
import {sendCardViaContext} from "../card";

export const cardActions = (bot: Telegraf<MyContext>, userActionState: UserStatesType, cardsState: CardStatesType) => {

    bot.action('CARD_SETTINGS', async (ctx: Context) => {
        await ctx.editMessageReplyMarkup(cardSettingsMenu)
    })

    bot.action('CARD_MENU', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (userId) {
            const menu = cardsState[userId].cardType === 'random' ? randomCardMenu : learningCardsMenu;
            await ctx.editMessageReplyMarkup(menu)
        }
    })

    bot.action('DELETE_CARD', async (ctx: Context) => {
        await ctx.editMessageText('Are you sure you want to delete this card?', confirmationMenu)
    })

    bot.action('YES_DELETE_CARD', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (userId) {
            const {cards, currentIndex} = cardsState[userId]
            const cardId = cards[currentIndex].id
            const resultDeleting = await deleteCardFromDB(userId, cardId);
            if (resultDeleting) {
                await ctx.editMessageText('Card was deleted successfully.', backToMenus);
            } else {
                await ctx.editMessageText('Something went wrong. Try again', confirmationMenu)
            }
        }
    })

    bot.action('EDIT_CARD', async (ctx: Context) => {
        const {userId, username} = getUserData(ctx)
        if (userId) {
            userActionState[userId] = {username: username, step: ActionSteps.EditCard};
            await ctx.editMessageText('Choose what you want to edit', {reply_markup: editCardMenu})
        }
    })

    bot.action('EDIT_ENGLISH_PHRASE', async (ctx: Context) => {
        const {userId, username} = getUserData(ctx)
        if (userId) {
            try {
                userActionState[userId] = {username: username, step: ActionSteps.EditEnglishPhrase};
                const {cards, currentIndex} = cardsState[userId]
                const card = getCurrentCard(cards, currentIndex);
                const oldPhrase = escapeMarkdownV2(card.english_phrase)
                await ctx.replyWithMarkdownV2(`✏️ Your old phrase:\n \`${oldPhrase}\`\n\n Enter a new phrase`, {reply_markup: {force_reply: true}})
            } catch (error){
                console.error(error)
                await ctx.editMessageText("Something went wrong. Please, try again or write @diffurchik", mainMenu)
            }
        }
    })

    bot.action('EDIT_TRANSLATION', async (ctx: Context) => {
        const {userId, username} = getUserData(ctx)
        if (userId) {
            try {
                userActionState[userId] = {username: username, step: ActionSteps.EditTranslation};
                const {cards, currentIndex} = cardsState[userId]
                const card = getCurrentCard(cards, currentIndex);
                const oldPhrase = escapeMarkdownV2(card.translate)
                await ctx.replyWithMarkdownV2(`✏️ Your old translation:\n \`${oldPhrase}\`\n\n Enter a new translation`, {reply_markup: {force_reply: true}})
            } catch (error) {
                console.error(error)
                await ctx.editMessageText("Something went wrong. Please, try again or write @diffurchik", mainMenu)
            }
        }
    })

    bot.action('EDIT_EXAMPLE', async (ctx: Context) => {
        const {userId, username} = getUserData(ctx)
        if (userId) {
            userActionState[userId] = {username: username, step: ActionSteps.EditExamples};
            const {cards, currentIndex} = cardsState[userId]
            const card = getCurrentCard(cards, currentIndex);
            let oldPhrase: string | undefined
            if (card.examples) {
                oldPhrase = escapeMarkdownV2(card.examples)
                await ctx.reply(`✏️ Your old example:\n \`${oldPhrase}\`\n\n Enter a new example`, {reply_markup: {force_reply: true}})
            } else {
                await ctx.reply(`✏️ Add an example`, {reply_markup: {force_reply: true}})
            }
        }
    })

    bot.action('BACK_TO_CARD', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (userId) {
            try {
                const menu = cardsState[userId].cardType === 'random' ? randomCardMenu : learningCardsMenu;
                if (cardsState[userId].cardType === 'learning' && cardsState[userId].currentIndex > 1) {
                    cardsState[userId].currentIndex--
                }
                await sendCardViaContext(menu, cardsState, ctx);
            } catch (error) {
                console.error(error)
                await ctx.editMessageText("Something went wrong. Please, try again or write @diffurchik", mainMenu)
            }
        }
    })
}