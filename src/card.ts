import {Card} from "./types";
import {learnCardsMenu} from "./menus";

export const formattedText = (card: Partial<Card>): string => {
    let formattedCard = ''

    if (card.examples) {
        formattedCard = `\n\n*English Phrase* \n${card.english_phrase}\n\n\n*Translation*\n ${card.translate}\n\n\n*Example*\n ${card.examples}`;
    } else {
        formattedCard = `\n\n*English Phrase* \n${card.english_phrase}\n\n\n*Translation*\n ${card.translate}`;
    }

    return formattedCard
}


export async function sendCard(menuButtons: any, ctx: any, cardsState: Record<number, {
    cards: Card[];
    currentIndex: number,
    lastMessageId?: number
}>) {
    const userId = ctx.from.id;
    const {cards, currentIndex} = cardsState[userId];
    const card = cards[currentIndex];
    const formattedCard = formattedText(card)

    return await ctx.replyWithMarkdownV2(`📝 Card ${currentIndex + 1}:${formattedCard}`, {reply_markup: menuButtons});

}

export async function sendCardAndDeletePreviousMessage(ctx: any, userId: number, userCardState: Record<number, {
    cards: Card[];
    currentIndex: number,
    lastMessageId?: number
}>) {
    const {cards, currentIndex, lastMessageId} = userCardState[userId];

    const buttonName = currentIndex === cards.length ? 'Last card' : 'Next card'

    const sentMessage = await sendCard(learnCardsMenu, ctx, userCardState)

    if (lastMessageId) {
        try {
            await ctx.deleteMessage(lastMessageId);
        } catch (error) {
            console.error('Error deleting previous message:', error);
        }
    }

    userCardState[userId].lastMessageId = sentMessage.message_id;
}