import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import readline from "readline";
import { env } from "../config/env.js";

const rl = readline.createInterface({
    input : process.stdin,
    output : process.stdout
});

async function ask(q: string) : Promise<string> {
    return new Promise((resolve) => rl.question(q , resolve));
}

(async () => {
    const apiId = Number(env.TG_API_ID);
    const apiHash = env.TG_API_HASH;
    const session = new StringSession(env.TG_SESSION);


    const client = new TelegramClient(session , apiId , apiHash , {
        connectionRetries: 5
    });

    await client.start({
        phoneNumber : () => ask(' Phone Number : '),
        password : () => ask('2FA Password (if any) : '),
        phoneCode : () => ask('Verification Code : '),
        onError : console.error,
    });

    console.log("\n Login Successful!");
    console.log("\n Copy this TG_SESSION into your .env:\n");
    console.log(client.session.save());
    console.log("\n DO NOT share this string!");

    rl.close();

})();