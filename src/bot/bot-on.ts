import {message} from "telegraf/filters";
import {ActionSteps, CardStatesType, MyContext, UserScheduleType, UserStatesType} from "../types";
import {scheduleCard, setRandomCardTime, setReminderTime} from "../schedule";
import {escapeMarkdownV2, getCurrentCard} from "../helper";
import {backToSettingsMenu, editCardMenu} from "./menus";
import {updateCardData} from "../db";
import {sendCardViaContext} from "./card";
import {Context, Telegraf} from "telegraf";

export const botOn = (bot: Telegraf<MyContext>, userActionState: UserStatesType, cardsState: CardStatesType) => {

    bot.on(message('text'), async (ctx) => {
        const userId = ctx.from.id;

        if (!userActionState[userId]) {
            await ctx.reply('Please start by selecting an action.');
            return;
        }

        let state = userActionState[userId]

        if (state.step === ActionSteps.AddEnglishPhrase) {
            userActionState[userId].englishPhrase = ctx.message.text
            userActionState[userId].step = ActionSteps.AddTranslation
            await ctx.reply('Got it 👍 \nNow, please enter the translation for it:', {reply_markup: {force_reply: true}});
            return;
        }

        if (state.step === ActionSteps.AddTranslation) {
            userActionState[userId].translation = ctx.message.text
            await ctx.replyWithMarkdownV2('All set 📌\nClick `"Add examples"` if you want to add examples of use or Click `"Finish"` to save it', {
                reply_markup: {
                    inline_keyboard: [
                        [{text: '✍️ Add examples', callback_data: 'EXAMPLES'}, {
                            text: 'Finish 🏁',
                            callback_data: 'FINISH'
                        }]
                    ],
                    resize_keyboard: true,
                    one_time_keyboard: true
                },
            });
            return;
        }

        if (state.step === ActionSteps.AddExamples) {
            userActionState[userId].examples = ctx.message.text
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

        if (state.step === ActionSteps.EditCard) {

        }

        if (state.step === ActionSteps.SetRandomTime) {
            const time = ctx.message.text;
            await handleTimeSetting(ctx, userId, time, ActionSteps.SetRandomTime, bot);
        }

        if (state.step === ActionSteps.SetReminderTime) {
            const time = ctx.message.text;
            await handleTimeSetting(ctx, userId, time, ActionSteps.SetReminderTime, bot);
        }

        if (state.step === ActionSteps.EditEnglishPhrase) {
            const newPhrase = ctx.message.text;
            const {cards, currentIndex} = cardsState[userId]
            const card = getCurrentCard(cards, currentIndex)
            const cardId = card.id
            try {
                await updateCardData('english_phrase', newPhrase, userId, cardId);
                cards[currentIndex].english_phrase = newPhrase;
                await sendCardViaContext(editCardMenu, cardsState, ctx)
            } catch {
                ctx.reply('Something went wrong', {reply_markup: editCardMenu});
            }

        }

        if (state.step === ActionSteps.EditTranslation) {
            const newTranslation = ctx.message.text;
            const {cards, currentIndex} = cardsState[userId]
            const card = getCurrentCard(cards, currentIndex)
            const cardId = card.id
            try {
                await updateCardData('translate', newTranslation, userId, cardId);
                cards[currentIndex].translate = newTranslation;
                await sendCardViaContext(editCardMenu, cardsState, ctx)
            } catch {
                ctx.reply('Something went wrong, please try again', {reply_markup: editCardMenu});
            }
        }

        if (state.step === ActionSteps.EditExamples) {
            const newExamples = ctx.message.text;
            const {cards, currentIndex} = cardsState[userId]
            const card = getCurrentCard(cards, currentIndex)
            const cardId = card.id
            try {
                await updateCardData('examples', newExamples, userId, cardId);
                cards[currentIndex].examples = newExamples;
                await sendCardViaContext(editCardMenu, cardsState, ctx)
            } catch {
                ctx.reply('Something went wrong, please try again', {reply_markup: editCardMenu});
            }
        }
    })

    async function handleTimeSetting(
        ctx: Context,
        userId: number,
        time: string,
        actionStep: ActionSteps,
        bot: Telegraf<MyContext>
    ) {
        if (!/^\d{2}:\d{2}$/.test(time)) {
            return ctx.reply("Invalid time format. Please enter time as HH:MM (24-hour).");
        }
        if (!ctx.from) return
        let userCurrentSchedule
        if(actionStep === ActionSteps.SetRandomTime) {userCurrentSchedule = await setRandomCardTime(userId, time, true)}
        if(actionStep === ActionSteps.SetReminderTime) {userCurrentSchedule = await setReminderTime(userId, time, true)}

        const userSchedule: UserScheduleType = {
            id: userCurrentSchedule?.id || undefined,
            user_id: ctx.from.id,
            show_random_card: userCurrentSchedule?.show_random_card || false,
            rand_card_time: userCurrentSchedule?.rand_card_time || '',
            timezone: 'UTC',
            reminder_time: userCurrentSchedule?.reminder_time || '',
            send_reminder: userCurrentSchedule?.send_reminder || false,
        };

        scheduleCard(userSchedule, ctx, bot);

        const actionText =
            actionStep === ActionSteps.SetRandomTime
                ? "a random card daily"
                : "a reminder daily";

        const message = escapeMarkdownV2(`Got it! I'll send you ${actionText} at ${time}`);
        await ctx.replyWithMarkdownV2(message, backToSettingsMenu);
    }
}

