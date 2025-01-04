import {Telegraf} from 'telegraf';
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

const BOT_TOKEN = '8084776606:AAGDCeqWhkYN7tXcZoDjLy0Eq8W3Ip3Wc0M'; // test
// const BOT_TOKEN = '8060710922:AAFVRXNGB7a-NmwTzYEDeWx6pNzUrvSzKXM'; // prod

if (!BOT_TOKEN) {
    throw new Error('Bot token is missing. Please add your bot token.');
}

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
    await loadSchedules(ctx, cardsState, bot)
})

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));