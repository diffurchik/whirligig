import {
    getAllUserSchedules,
    getRandomCardByUserId,
    getScheduleByUser,
    insertRandomCardTime,
    updateRandomCardTime
} from "./db";
import {CardStatesType, MyContext, UserScheduleType} from "./types";
import cron from 'node-cron';
import {sendCardViaBot} from "./bot/card";
import {randomCardMenu} from "./bot/menus";
import { ScheduledTask } from 'node-cron'
import {Context, Telegraf} from "telegraf";

const scheduledJobs: Record<number, ScheduledTask> = {};

export async function loadSchedules(ctx: any, cardState: CardStatesType, bot: Telegraf<MyContext>) {
    const schedules = await getAllUserSchedules()
    if (schedules && schedules.length !== 0) {
        schedules.forEach((schedule) => {
            scheduleCard(schedule, ctx, cardState, bot)
        })
    }
    console.log('scheduledJobs', scheduledJobs)
}

export function scheduleCard(schedule: UserScheduleType, ctx: Context, cardsState: CardStatesType, bot: Telegraf<MyContext>) {
    const {user_id, rand_card_time, show_random_card} = schedule

    if(!show_random_card){
        return
    }

    if (scheduledJobs[user_id]) {
        scheduledJobs[user_id].stop()
        delete scheduledJobs[user_id]
    }

    const [hours, minute] = rand_card_time.split(':')
    const cronExpression = `0 ${minute} ${hours} * * *`

    scheduledJobs[user_id] = cron.schedule(
        cronExpression, async () => {
            const randomCard = await getRandomCardByUserId(user_id);
            console.log('randomCard', randomCard)
            if (randomCard) {
                console.log('ctx', ctx)
                await bot.telegram.sendMessage(user_id, "✨ *Scheduled Card* ✨", { parse_mode: 'MarkdownV2' })

                await sendCardViaBot(randomCardMenu, randomCard, bot, user_id);
            } else {
                await ctx.reply('There is not cards to study \n Click "Add new" to start education');
            }
        }
    )
}

export async function setRandomCardTime(userId: number, time: string, showRandomCard: boolean) {
    const scheduleByUser = await getScheduleByUser(userId)
    let id: number | undefined
    if (!scheduleByUser || scheduleByUser.length === 0) {
       id = await insertRandomCardTime(userId, time, showRandomCard);
    } else {
        await updateRandomCardTime(userId, time);
    }

    return id

}