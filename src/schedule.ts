import {getAllUserSchedules, getRandomCardByUserId} from "./db";
import {Card, UserSchedule} from "./types";
import cron from 'node-cron';
import {sendCard} from "./card";
import {randomCardMenu} from "./menus";
import { ScheduledTask } from 'node-cron'

const scheduledJobs: Record<number, ScheduledTask> = {};

export async function loadSchedules(ctx: any, cardState: Record<number, {
    cards: Card[];
    currentIndex: number,
    lastMessageId?: number
}>) {
    const schedules = await getAllUserSchedules()
    if (schedules && schedules.length === 0) {
        schedules.forEach((schedule) => {
            scheduleCard(schedule, ctx, cardState)
        })
    }
}

export function scheduleCard(schedule: UserSchedule, ctx: any, cardsState: Record<number, {
    cards: Card[];
    currentIndex: number,
    lastMessageId?: number
}>) {
    const {user_id, rand_card_time, timezone = 'UTC'} = schedule

    if (scheduledJobs[user_id]) {
        scheduledJobs[user_id].stop()
        delete scheduledJobs[user_id]
    }

    const [hours, minute] = rand_card_time.split(':')
    const cronExpression = `0 ${minute} ${hours} * * *`

    scheduledJobs[user_id] = cron.schedule(
        cronExpression, async () => {
            const randomCard = await getRandomCardByUserId(user_id);
            if (randomCard) {
                await ctx.replyWithMarkdownV2("✨ *Scheduled Card* ✨")
                cardsState[user_id] = {cards: [randomCard], currentIndex: 0};
                await sendCard(randomCardMenu, ctx, user_id, cardsState);
            } else {
                ctx.reply('There is not cards to study \n Click "Add new" to start education');
            }
        }
    )
}