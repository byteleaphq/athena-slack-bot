import {
  AllMiddlewareArgs,
  KnownBlock,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
import { prisma } from "../app";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { getSetConfigAppHome } from "../blocks/getSetConfigAppHome";

import { getUserTeamInfo } from "../lib/getUserTeamInfo";

import { Acp } from "@athena-ai/sdk";
import { base64DecodeForBasicAuth } from "../lib/base64ForBasicAuth";

async function validateTeamAndAthenaInfo(
  teamId: string | undefined
): Promise<{ athena_brain_id: string; athena_api_token: string }> {
  const teamInfo = await prisma.teams.findFirst({
    where: { team_id: teamId },
  });

  if (teamInfo && teamInfo.athena_brain_id && teamInfo.athena_api_token) {
    return {
      athena_brain_id: teamInfo.athena_brain_id,
      athena_api_token: teamInfo.athena_api_token,
    };
  }

  throw new Error("Validation failed");
}

const convertHeadingsAndBold = (markdown: string) => {
  return markdown
    .replace(
      /^(#{1,6}) (.*$)/gim,
      (_: any, __: any, content: any) => `*${content}* `
    )
    .replace(/\*\*(.*?)\*\*/g, "*$1*");
};
export const appMentionHandler = async (
  payload: SlackEventMiddlewareArgs<"app_mention"> &
    AllMiddlewareArgs<StringIndexed>
) => {
  const { event, say, client } = payload;

  let is_admin: boolean = false;

  const threadId = event.thread_ts || event.ts;
  const isRootMessage = event.thread_ts ? false : true;
  const teamId = event.team;
  const message = event.text.split(" ").slice(1).join(" ");

  try {
    const userInfo = await getUserTeamInfo(event.user as string, client);

    is_admin = userInfo.is_admin;

    const { athena_brain_id, athena_api_token } =
      await validateTeamAndAthenaInfo(teamId);

    const { username, password } = base64DecodeForBasicAuth(athena_api_token);

    const athenaCopilot = new Acp({
      serverURL: process.env.ACP_SERVER_URL,
      security: {
        username: username,
        password: password,
      },
    });

    await client.reactions.add({
      name: "eyes",
      channel: event.channel,
      timestamp: event.ts,
    });

    async function sendMsgAndRemoveEmoji(response: string) {
      const blocks: KnownBlock[] = [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: convertHeadingsAndBold(response),
          },
        },
      ];

      if (isRootMessage) {
        blocks.push({
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Tag `@Athena Copilot` and reply to this thread to continue the chat. :speech_balloon:",
            },
          ],
        });
      }

      await say({
        thread_ts: event.ts,
        // text: response,
        blocks: blocks,
        mrkdwn: true,
      });

      await client.reactions.remove({
        name: "eyes",
        channel: event.channel,
        timestamp: event.ts,
      });
    }

    if (isRootMessage) {
      const chat = await athenaCopilot.chat.createChatThreadWithMsg({
        brainId: athena_brain_id,
        name: "Slack Chat - " + new Date().toISOString(),
        message: message,
      });

      if (!chat) throw new Error("Chat creation failed");

      const { threadId: chatId, message: response } = chat[0];

      await prisma.chats.create({
        data: { chat_id: chatId, team_id: teamId, thread_id: threadId },
      });
      if (!response) throw new Error("Chat creation failed");

      await sendMsgAndRemoveEmoji(response);
      return;
    }

    const chatInfo = await prisma.chats.findFirst({
      where: { thread_id: threadId },
    });

    if (!chatInfo || !chatInfo.chat_id)
      throw new Error("Chat info validation failed");

    const chatInteractions = await athenaCopilot.chat.sendChatMessage({
      chatThreadId: chatInfo.chat_id,
      text: message,
    });

    if (!chatInteractions) throw new Error("Chat response failed");

    const response = chatInteractions[0]?.message as string;

    await sendMsgAndRemoveEmoji(response);
  } catch (error: any) {
    console.log(error);

    if (error.message === "Validation failed") {
      await say({
        thread_ts: threadId,
        blocks: getSetConfigAppHome(is_admin),
      });
      return;
    }

    await client.reactions.remove({
      name: "eyes",
      channel: event.channel,
      timestamp: event.ts,
    });

    await say({
      thread_ts: threadId,
      text: "I'm sorry, I couldn't process your request. Please try again.",
    });
  }
};
