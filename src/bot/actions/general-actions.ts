import {Context, Telegraf} from 'telegraf';
import {addedCardMenu, backToMenus, mainMenu, settingsMenu, studyMenu} from "../menus";
import {formattedText} from "../card";
import {getAllCardsByUserId, getScheduleByUser, insertPhrase, updateShowRandomCardDaily,} from "../../db";
import {escapeMarkdownV2, getUserData} from "../../helper";
import {ActionSteps, Card, CardStatesType, MyContext, UserStatesType} from "../../types";

export const botActions = (bot: Telegraf<MyContext>, userActionState: UserStatesType, cardsState: CardStatesType) => {


    bot.action('ADD_NEW', async (ctx: Context) => {
        const {userId, username} = getUserData(ctx)
        if (userId) {
            userActionState[userId] = {username: username, step: ActionSteps.AddEnglishPhrase};
            await ctx.reply('🖖 Please, enter the English phrase you want to learn', {reply_markup: {force_reply: true}})
        }
    })

    bot.action('STUDY_MENU', async (ctx: Context) => {
        await ctx.editMessageText("Choose an option from the Study menu:", studyMenu)
    })


    bot.action('MAIN_MENU', async (ctx: Context) => {
        await ctx.editMessageText("You are in the main menu Choose an option:", mainMenu)
    })

    bot.action('SETTINGS', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (userId) {
            const userSchedule = await getScheduleByUser(userId)
            if (userSchedule && userSchedule.length > 0) {
                const {show_random_card, rand_card_time} = userSchedule[0]
                const text: string = `Your current settings is: \n\n ▪️Send a random card daily: ${show_random_card}\n ▪️Time to send a random card: ${rand_card_time}`
                await ctx.editMessageText(text, settingsMenu(show_random_card))
            }
        }
    })

    bot.action('EXAMPLES', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (userId) {
            const {englishPhrase} = userActionState[userId];
            await ctx.reply(`Enter example how to use ${englishPhrase}`, {reply_markup: {force_reply: true}});
            userActionState[userId].step = ActionSteps.AddExamples
        }
    })

    bot.action("FINISH", async (ctx: Context) => {

        const {userId} = getUserData(ctx)
        if (userId) {
            const {username, englishPhrase, translation, examples} = userActionState[userId];
            let cardId: number
            if (englishPhrase && translation && username) {
                cardId = await insertPhrase(userId, username, englishPhrase, translation, examples)
                    .catch(() => {
                        throw new Error()
                    });
                const formattedCard = formattedText({
                    english_phrase: englishPhrase,
                    translate: translation,
                    examples: examples
                })

                try {
                    await ctx.reply(`Your phrase and translation have been saved! 🎉`);
                    await ctx.replyWithMarkdownV2(`📝 New card:${formattedCard}`, addedCardMenu)
                    const card: Card = {
                        id: cardId,
                        english_phrase: englishPhrase,
                        translate: translation,
                        examples,
                        learned: false
                    }
                    cardsState[userId] = {cards: [card], currentIndex: 0};
                } catch (error) {
                    await ctx.reply('something went wrong. Please, check your phrase and try again 🔄');
                }
            }
            delete userActionState[userId];
        }
    })

    bot.action('ALL_CARDS', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (userId) {
            const cards = await getAllCardsByUserId(userId) as Card[]
            if (cards.length > 0) {
                const cardsList = cards.map((card, index) =>
                    `🔸 #${index}\n--English Phrase:\n${card.english_phrase}\n--Translation:\n${card.translate}\n--Example: \n${card.examples}\n\n--Learned: ${card.learned ? '✅' : 'in process'} `).join('\n---------------------\n\n')
                await ctx.editMessageText(cardsList, backToMenus);
            } else {
                const text = escapeMarkdownV2('There is no card. You can add a card by the menu');
                await ctx.editMessageText(text, backToMenus);

            }
        }
    })

    bot.action('SET_SENDING_RANDOM_CARD', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (userId) {
            const userSchedule = await getScheduleByUser(userId)
            if (userSchedule && userSchedule.length > 0) {
                const {show_random_card, rand_card_time} = userSchedule[0]
                await updateShowRandomCardDaily(userId, !show_random_card)
                const text: string = !show_random_card ? `You will get a random card daily at ${rand_card_time}` : 'You will not get a random card daily'
                await ctx.editMessageText(text, settingsMenu(!show_random_card))
            }
        }
    })

    bot.action('SET_RANDOM_CARD_TIME', async (ctx: Context) => {
        const {userId, username} = getUserData(ctx)
        await ctx.reply("At what time (HH:MM, 24-hour format) should I send you a random card daily?", {reply_markup: {force_reply: true}})
        if (userId) {
            userActionState[userId] = {username: username, step: ActionSteps.SetRandomTime};
        }
    })
};