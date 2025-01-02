import {Card} from "./types";

export function escapeMarkdownV2(text: string): string {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1')
}

export function getCurrentCard(cards: Card[], index: number): Card {
    return index >= cards.length ? cards[index - 1] : cards[index];
}