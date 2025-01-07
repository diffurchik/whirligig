import {
    getAllUserSchedules,
    getRandomCardByUserId,
    getScheduleByUser,
    insertRandomCardTime, insertReminderTime,
    updateRandomCardTime, updateReminderTime
} from "./db";
import {MyContext, UserScheduleType} from "./types";
import cron from 'node-cron';
import {sendCardViaBot} from "./bot/card";
import {optionsToLearnMenu, randomCardMenu} from "./bot/menus";
import {ScheduledTask} from 'node-cron'
import {Context, Telegraf} from "telegraf";

const scheduledJobs: Record<number, ScheduledTask> = {};

export async function loadSchedules(ctx: any, bot: Telegraf<MyContext>) {
    const schedules = await getAllUserSchedules()
    if (schedules && schedules.length !== 0) {
        schedules.forEach((schedule) => {
            scheduleCard(schedule, ctx, bot)
        })
    }
    console.log('scheduledJobs', scheduledJobs)
}

export function scheduleCard(schedule: UserScheduleType, ctx: Context, bot: Telegraf<MyContext>) {
    const {user_id, rand_card_time, show_random_card, reminder_time, send_reminder} = schedule

    if (scheduledJobs[user_id]) {
        scheduledJobs[user_id].stop()
        delete scheduledJobs[user_id]
    }

    if(show_random_card && rand_card_time) {
        const [randHours, randMinute] = rand_card_time.split(':')
        const cronExpressionRandom = `0 ${randMinute} ${randHours} * * *`

        scheduledJobs[user_id] = cron.schedule(
            cronExpressionRandom, async () => {
                const randomCard = await getRandomCardByUserId(user_id);
                console.log('randomCard', randomCard)
                if (randomCard) {
                    console.log('ctx', ctx)
                    await bot.telegram.sendMessage(user_id, "✨ *Scheduled Card* ✨", {parse_mode: 'MarkdownV2'})

                    await sendCardViaBot(randomCardMenu, randomCard, bot, user_id);
                } else {
                    await ctx.reply('There is not cards to study \n Click "Add new" to start education');
                }
            }
        )
    }

    if(send_reminder && reminder_time){
        const [remindHours, remindMinute] = reminder_time.split(':')
        const cronExpressionReminder = `0 ${remindMinute} ${remindHours} * * *`
        scheduledJobs[user_id] = cron.schedule(cronExpressionReminder, async () => { //todo: if there is already schedule for user
            console.log(`send reminder for ${user_id}`)
            await bot.telegram.sendMessage(user_id, '💡Time to study💡')
        })
    }

}

export async function setRandomCardTime(userId: number, time: string, showRandomCard: boolean): Promise<UserScheduleType | undefined> {
    const scheduleByUser = await getScheduleByUser(userId)
    let userSchedule: UserScheduleType | undefined
    if (!scheduleByUser || scheduleByUser.length === 0) {
        userSchedule = await insertRandomCardTime(userId, time, showRandomCard);
    } else {
        await updateRandomCardTime(userId, time);
        const userSchedules = await getScheduleByUser(userId)
        userSchedule = userSchedules? userSchedules[0] : undefined
    }

    return userSchedule
}

export async function setReminderTime(userId: number, time: string, sendReminder: boolean) {
    const scheduleByUser = await getScheduleByUser(userId)
    let id: number | undefined
    if (!scheduleByUser || scheduleByUser.length === 0) {
        id = await insertReminderTime(userId, time, sendReminder);
    } else {
        await updateReminderTime(userId, time);
    }

    return id
}