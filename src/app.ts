import { App, Installation, InstallationQuery, LogLevel } from "@slack/bolt";

import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { appMentionHandler } from "./handlers/chatHandler";
import { appHomeOpenedHandler } from "./handlers/appHomeOpenedHandler";
import { connectAccountButtonHandler } from "./handlers/connectAccountButtonHandler";
import { configModalFormHandler } from "./handlers/configModalFormHandler";
export const prisma = new PrismaClient();

const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  scopes: [
    "app_mentions:read",
    "channels:history",
    "channels:read",
    "chat:write",
    "chat:write.public",
    "groups:history",
    "incoming-webhook",
    "reactions:read",
    "users.profile:read",
    "users:read",
    "reactions:write",
  ],
  logLevel:
    process.env.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.ERROR,
  installationStore: {
    async storeInstallation(installation: Installation): Promise<void> {
      if (
        installation.isEnterpriseInstall &&
        installation.enterprise !== undefined
      ) {
        await prisma.installation.create({
          data: {
            installationId: installation.enterprise.id,
            installationType: installation.isEnterpriseInstall
              ? "enterprise"
              : "team",
            enterpriseId: installation.enterprise.id,
            teamId: installation.team?.id || undefined,
            installationData: {},
          },
        }); // Explicitly return undefined to match Promise<void>
      } else if (installation.team !== undefined) {
        // single team app installation
        await prisma.installation.create({
          data: {
            installationId: installation.team.id,
            installationType: installation.isEnterpriseInstall
              ? "enterprise"
              : "team",
            enterpriseId: installation.enterprise?.id || undefined,
            teamId: installation.team.id,
            installationData: installation as any,
          },
        }); // Explicitly return undefined to match Promise<void>
      } else {
        throw new Error("Failed saving installation data to installationStore");
      }
    },
    async fetchInstallation(
      query: InstallationQuery<boolean>
    ): Promise<Installation> {
      if (query.isEnterpriseInstall && query.enterpriseId !== undefined) {
        const installationDBResult = await prisma.installation.findFirst({
          where: {
            installationId: query.enterpriseId,
            installationType: "enterprise",
          },
        });
        const installation =
          installationDBResult?.installationData as unknown as Installation;

        return installation;
      } else if (query.teamId !== undefined) {
        const installationDBResult = await prisma.installation.findFirst({
          where: {
            installationId: query.teamId,
            installationType: "team",
          },
        });
        const installation =
          installationDBResult?.installationData as unknown as Installation;
        return installation;
      } else {
        throw new Error(
          "Failed fetching installation data from installationStore"
        );
      }
    },
    deleteInstallation(query: InstallationQuery<boolean>): Promise<void> {
      if (query.isEnterpriseInstall && query.enterpriseId !== undefined) {
        return prisma.installation.deleteMany({
          where: {
            installationId: query.enterpriseId,
            installationType: "enterprise",
          },
        }) as any;
      } else if (query.teamId !== undefined) {
        return prisma.installation.deleteMany({
          where: {
            installationId: query.teamId,
            installationType: "team",
          },
        }) as any;
      } else {
        throw new Error(
          "Failed deleting installation data from installationStore"
        );
      }
    },
  },
  installerOptions: {
    // If this is true, /slack/install redirects installers to the Slack authorize URL
    // without rendering the web page with "Add to Slack" button..
    directInstall: false,
  },
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
