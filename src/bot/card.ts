import {Card, CardStatesType, MyContext} from "../types";
import {learningCardsMenu} from "./menus";
import {escapeMarkdownV2} from "../helper";
import {Telegraf} from "telegraf";

export const formattedText = (card: Partial<Card>): string => {
    let formattedCard: string
    const escapedEnglishPhrase = escapeMarkdownV2(card.english_phrase!)
    const escapedTranslation = escapeMarkdownV2(card.translate!)
    const escapedExample = card.examples ? escapeMarkdownV2(card.examples!) : undefined

    if (card.examples) {
        formattedCard = `\n\n*English Phrase* \n${escapedEnglishPhrase}\n\n\n*Translation*\n ${escapedTranslation}\n\n\n*Example*\n ${escapedExample}`;
    } else {
        formattedCard = `\n\n*English Phrase* \n${escapedEnglishPhrase}\n\n\n*Translation*\n ${escapedTranslation}`;
    }

    return formattedCard
}


export async function sendCardViaContext(menuButtons: any, cardsState: CardStatesType, ctx: any) {
    const userId: number | undefined = ctx?.from?.id
    if (userId) {
        const {cards, currentIndex} = cardsState[userId];
        const card = cards[currentIndex];
        const formattedCard = formattedText(card)

        return await ctx!.replyWithMarkdownV2(`📝 Card ${currentIndex + 1}:${formattedCard}`, {reply_markup: menuButtons});
    }
}

export async function sendCardViaBot(menuButtons: any, card: Card, bot: Telegraf<MyContext>, chatId: number) {
    const formattedCard = formattedText(card)
    return await bot.telegram.sendMessage(chatId, `📝 Card :${formattedCard}`, {reply_markup: menuButtons, parse_mode: "MarkdownV2"})

}

export async function sendCardAndDeletePreviousMessage(ctx: any, userId: number, cardsState: CardStatesType) {
    const {lastMessageId} = cardsState[userId];

    const sentMessage = await sendCardViaContext(learningCardsMenu, cardsState, ctx)

    if (lastMessageId) {
        try {
            await ctx.deleteMessage(lastMessageId);
        } catch (error) {
            console.error('Error deleting previous message:', error);
        }
    }

    if (sentMessage) {
        cardsState[userId].lastMessageId = sentMessage.message_id;
    }
}