import {randomCardMenu, studyMenu} from "./menus";
import {getRandomCardByUserId} from "../db";
import {sendCard} from "./card";
import {Context, Telegraf} from "telegraf";
import {CardStatesType, MyContext, UserStatesType} from "../types";
import {getUserData} from "../helper";

export const botCommands = (bot: Telegraf<MyContext>, userActionState: UserStatesType, cardsState: CardStatesType) => {
    bot.telegram.setMyCommands([
        {command: 'start', description: 'Start the bot'},
        {command: 'add_card', description: 'Add a new card'},
        {command: 'study', description: 'Study your cards'},
        {command: 'random_card', description: 'Get a random card'},
        {command: 'help', description: 'Get help'}
    ]).catch(err => console.log(err));

    bot.command('add_card', async (ctx: Context) => {
        const {userId, username} = getUserData(ctx)
        if(userId){
            userActionState[userId] = {username: username, step: 'add_english_phrase'};
            await ctx.reply('🖖 Please, enter the English phrase you want to learn', {reply_markup: {force_reply: true}})
        }
    })

    bot.command('study', async (ctx: Context) => {
        await ctx.reply("Choose an option from the Study menu:", studyMenu)
    })

    bot.command('random_card', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if(userId){
            const card = await getRandomCardByUserId(userId)
            if (card) {
                cardsState[userId] = {cards: [card], currentIndex: 0, cardType: 'random'};
                await sendCard(randomCardMenu, ctx, cardsState);
            } else {
                ctx.reply('There is not cards to study \n Click "Add new" to start education');
            }
        }
    })

    bot.command('help', async (ctx: Context) => {
        await ctx.reply('Please, write @diffurchik if you have any troubles');
    })
}