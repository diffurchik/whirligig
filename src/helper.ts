export function escapeMarkdownV2(text: string): string {
    const result = text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
    console.log('escapeMarkdownV2 ', text, 'result ', result);
    return result
}