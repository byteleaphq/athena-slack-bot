import {
  AllMiddlewareArgs,
  KnownBlock,
  SlackEventMiddlewareArgs,
} from "@slack/bolt";
import { prisma } from "../app";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { getSetConfigAppHome } from "../blocks/getSetConfigAppHome";

import { getUserTeamInfo } from "../lib/getUserTeamInfo";

import { AthenaCopilot } from "@athena-ai/sdk";
import { base64DecodeForBasicAuth } from "../lib/base64ForBasicAuth";
import { Integration } from "@athena-ai/sdk/models/operations";

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

    const athenaCopilot = new AthenaCopilot({
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
            text: response,
          },
        },
      ];

      if (isRootMessage) {
        blocks.push({
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: "Reply to this thread to continue the chat. :speech_balloon:",
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
      const { chat } = await athenaCopilot.chat.postChat({
        brainId: athena_brain_id,
        name: "Slack Chat - " + new Date().toISOString(),
        integration: Integration.Files,
      });

      const chatId = chat?.id as unknown as string;

      const { chatInteraction } = await athenaCopilot.chat.postChatGetResponse({
        chatThreadId: chatId,
        text: message,
      });

      const response = chatInteraction?.message as string;

      if (!chatId) throw new Error("Chat creation failed");

      await prisma.chats.create({
        data: { chat_id: chatId, team_id: teamId, thread_id: threadId },
      });

      await sendMsgAndRemoveEmoji(response);
      return;
    }

    const chatInfo = await prisma.chats.findFirst({
      where: { thread_id: threadId },
    });

    if (!chatInfo || !chatInfo.chat_id)
      throw new Error("Chat info validation failed");

    const { chatInteraction } = await athenaCopilot.chat.postChatGetResponse({
      chatThreadId: chatInfo.chat_id,
      text: message,
    });

    const response = chatInteraction?.message as string;

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
