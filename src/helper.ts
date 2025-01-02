import {Card, UserData} from "./types";
import {Context} from "telegraf";

export function escapeMarkdownV2(text: string): string {
    return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1')
}

export function getCurrentCard(cards: Card[], index: number): Card {
    return index >= cards.length ? cards[index - 1] : cards[index];
}

export function getUserData(ctx: Context): UserData {
    const fromData = ctx.from
    let userData: UserData = {}
    if(fromData){
        userData.userId = fromData.id
        userData.username = fromData.username
    }
    return userData;
}