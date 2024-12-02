import {Composer, Markup, Scenes} from "telegraf";
import {MyContext, MyWizardSession} from "./types";

const stepHandler = new Composer<MyContext>();

stepHandler.action("next", async ctx => {
    ctx.scene.session.myWizardSessionProp = Math.floor(10 * Math.random());
    await ctx.reply("Step 2. Via inline button");
    return ctx.wizard.next();
});

stepHandler.command("next", async ctx => {
    ctx.scene.session.myWizardSessionProp = Math.floor(10 * Math.random()) + 10;
    await ctx.reply("Step 2. Via command");
    return ctx.wizard.next();
});

stepHandler.use(ctx =>
    ctx.replyWithMarkdown("Press `Next` button or type /next"),
);

export const superWizard = new Scenes.WizardScene(
    "super-wizard",
    async ctx => {
        await ctx.reply(
            "Step 1",
            Markup.inlineKeyboard([
                Markup.button.url("❤️", "http://telegraf.js.org"),
                Markup.button.callback("➡️ Next", "next"),
            ]),
        );
        return ctx.wizard.next();
    },
    stepHandler,
    async ctx => {
        const responseText = [
            "Step 3.",
            `Your random myWizardSessionProp is ${ctx.scene.session.myWizardSessionProp}`,
        ].join("\n");
        await ctx.reply(responseText);
        return ctx.wizard.next();
    },
    async ctx => {
        await ctx.reply("Step 4");
        return ctx.wizard.next();
    },
    async ctx => {
        await ctx.reply("Done");
        return await ctx.scene.leave();
    },
);