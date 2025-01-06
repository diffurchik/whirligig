import {Context, Telegraf} from "telegraf";
import {escapeMarkdownV2, getUserData} from "../../helper";
import {
    getScheduleByUser,
    insertRandomCardTime,
    insertReminderTime, updateReminderTime,
    updateSendReminder,
    updateShowRandomCardDaily
} from "../../db";
import {settingsMenu, settingsRandomCard, settingsReminder} from "../menus";
import {ActionSteps, MyContext, UserStatesType} from "../../types";

export const settingsActions = (bot: Telegraf<MyContext>, userActionState: UserStatesType) => {

    bot.action('SETTINGS', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (userId) {
            const userSchedule = await getScheduleByUser(userId)
            if (userSchedule && userSchedule.length > 0) {
                const {show_random_card, rand_card_time, reminder_time, send_reminder} = userSchedule[0]
                const text: string = `Your current settings is: \n\n` +
                    `▪️Send a random card daily: ${show_random_card ? `✅` : `No`}\n` +
                    `▪️Time to send a random card: *${rand_card_time ? rand_card_time : 'No'}*\n ` +
                    `▪️Send a study reminder daily: ${send_reminder ? '✅' : 'No'}\n ` +
                    `▪️Time to send a study reminder: *${reminder_time ? reminder_time : 'No'}*\n `
                await ctx.editMessageText(text, {reply_markup: settingsMenu(), parse_mode: "MarkdownV2"})
            } else {
                const text: string = `Your current settings is: \n\n ▪️Send a random card daily: No\n ▪️Time to send a random card: -`
                await ctx.editMessageText(text, {reply_markup: settingsMenu(), parse_mode: "MarkdownV2"})
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
                await ctx.editMessageText(text, {reply_markup: settingsRandomCard(!show_random_card)})
            } else {
                await insertRandomCardTime(userId, '09:00', true)
                const text: string = `You will get a random card daily at 09:00 You can change this time in the settings`
                await ctx.editMessageText(text, {reply_markup: settingsRandomCard(true)})
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

    bot.action('SETTINGS_RANDOM_CARD', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (userId) {
            const userSchedule = await getScheduleByUser(userId)
            if (userSchedule && userSchedule.length > 0) {
                const {show_random_card, rand_card_time} = userSchedule[0]
                const text: string = `Your current settings is: \n\n ▪️Send a random card daily: ${show_random_card ? `✅` : `No`}\n ▪️Time to send a random card: *${rand_card_time}*`
                await ctx.editMessageText(text, {
                    reply_markup: settingsRandomCard(show_random_card),
                    parse_mode: "MarkdownV2"
                })
            } else {
                const text: string = `Your current settings is: \n\n ▪️Send a random card daily: No\n ▪️Time to send a random card: -`
                await ctx.editMessageText(text, {reply_markup: settingsRandomCard()})
            }
        }
    })

    bot.action('SETTINGS_REMINDER', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (!userId) return
        const userSchedule = await getScheduleByUser(userId)
        if (userSchedule && userSchedule.length > 0) {
            const {send_reminder, reminder_time} = userSchedule[0]
            const text: string = `Your current settings is: \n\n ▪️Send a reminder daily: ${send_reminder ? `✅` : `No`}\n ▪️Time to send a reminder: *${reminder_time}*`
            await ctx.editMessageText(text, {reply_markup: settingsReminder(), parse_mode: "MarkdownV2"})
        } else {
            const text: string = `Your current settings is: \n\n ▪️Send a random card daily: No\n ▪️Time to send a random card: -`
            await ctx.editMessageText(text, {reply_markup: settingsReminder()})
        }

    })

    bot.action('SET_SENDING_REMINDER', async (ctx: Context) => {
        const {userId} = getUserData(ctx)
        if (!userId) return

        const userSchedule = await getScheduleByUser(userId)
        const hasSchedule = userSchedule && userSchedule.length > 0;
        const {send_reminder, reminder_time} = hasSchedule ? userSchedule[0] : {};

        const newSendReminder = !send_reminder;
        const reminderTime = reminder_time || '09:00';

        if (!hasSchedule || !reminder_time) {
            if (!hasSchedule) await insertReminderTime(userId, reminderTime, newSendReminder);
            else await updateReminderTime(userId, reminderTime);
        }

        await updateSendReminder(userId, newSendReminder);

        const text = newSendReminder
            ? `You will get a reminder daily at ${reminderTime}. You can change this time in the settings.`
            : 'You will not get a random card daily.';

        await ctx.editMessageText(text, {reply_markup: settingsReminder(newSendReminder)});

    })

    bot.action('SET_REMINDER_TIME', async (ctx: Context) => {
        const {userId, username} = getUserData(ctx)
        await ctx.reply("At what time (HH:MM, 24-hour format) should I send you a random card daily? For example: 11:30", {reply_markup: {force_reply: true}})
        if (userId) {
            userActionState[userId] = {username: username, step: ActionSteps.SetReminderTime};
        }
    })
}