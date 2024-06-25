import { App, LogLevel } from "@slack/bolt";

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { appMentionHandler } from "./handlers/chatHandler";
import { appHomeOpenedHandler } from "./handlers/appHomeOpenedHandler";
import { connectAccountButtonHandler } from "./handlers/connectAccountButtonHandler";
import { configModalFormHandler } from "./handlers/configModalFormHandler";
export const prisma = new PrismaClient();

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  logLevel:
    process.env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.ERROR,
});

app.event("app_mention", appMentionHandler);

app.event("app_home_opened", appHomeOpenedHandler);

app.action("connect_account_button", connectAccountButtonHandler);

app.view("config_form", configModalFormHandler);

(async () => {
  // Start your app
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Bolt app is running at " + port + 1);
})();
