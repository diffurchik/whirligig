import {Context, Telegraf} from "telegraf";
import {getUserData} from "../../helper";
import {getScheduleByUser, insertRandomCardTime, updateShowRandomCardDaily} from "../../db";
import {settingsMenu} from "../menus";
import {ActionSteps, MyContext, UserStatesType} from "../../types";

export const settingsActions = (bot: Telegraf<MyContext>, userActionState: UserStatesType) => {

    bot.action('SETTINGS', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (userId) {
            const userSchedule = await getScheduleByUser(userId)
            if (userSchedule && userSchedule.length > 0) {
                const {show_random_card, rand_card_time} = userSchedule[0]
                const text: string = `Your current settings is: \n\n ▪️Send a random card daily: ${show_random_card ? `Yes` : `No`}\n ▪️Time to send a random card: ${rand_card_time}`
                await ctx.editMessageText(text, settingsMenu(show_random_card))
            } else {
                const text: string = `Your current settings is: \n\n ▪️Send a random card daily: No\n ▪️Time to send a random card: -`
                await ctx.editMessageText(text, settingsMenu())
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
            } else {
                await insertRandomCardTime(userId, '09:00', true)
                const text: string = `You will get a random card daily at 09:00 You can change this time in the settings`
                await ctx.editMessageText(text, settingsMenu(true))
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
}