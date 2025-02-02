import {Telegraf} from 'telegraf';
import { config } from 'dotenv';
import {CardStatesType, MyContext, NewPhraseState} from './types'
import {
    mainMenu,
} from "./bot/menus";
import {loadSchedules} from "./schedule";
import {mainActions} from "./bot/actions/main-actions";
import {cardActions} from "./bot/actions/card-actions";
import {studyActions} from "./bot/actions/study-actions";
import {botCommands} from "./bot/commands";
import {botOn} from "./bot/bot-on";
import {settingsActions} from "./bot/actions/settings-actions";

config();
const isProduction = process.env.NODE_ENV === 'production';
const BOT_TOKEN = isProduction ? process.env.BOT_TOKEN_PROD : process.env.BOT_TOKEN_TEST;

if (!BOT_TOKEN) {
    throw new Error('Bot token is missing. Please add your bot token.');
}

console.log(`✅ Using ${isProduction ? 'PROD' : 'TEST'} bot token`);

export const bot = new Telegraf<MyContext>(BOT_TOKEN);
const userActionState: Record<number, Partial<NewPhraseState>> = {}
const cardsState: CardStatesType = {};
mainActions(bot, userActionState, cardsState)
cardActions(bot, userActionState, cardsState)
studyActions(bot, cardsState)
settingsActions(bot, userActionState)
botCommands(bot, userActionState, cardsState)
botOn(bot, userActionState, cardsState)

bot.start((ctx) =>
    ctx.reply('Welcome to the bot! Choose an option:', mainMenu
    ));

bot.launch(() => {
    console.log('Bot is running...')
}).catch(error => {
    console.error(error)
});

if (bot) bot.telegram.getMe().then(async (ctx) => {
    await loadSchedules(ctx, bot)
})

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));