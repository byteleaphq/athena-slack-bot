import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { createChat, getResponse } from "../lib/api";
import { prisma } from "../app";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { getSetConfigAppHome } from "../blocks/getSetConfigAppHome";

import { getUserTeamInfo } from "../lib/getUserTeamInfo";

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

  const { team_id, is_admin } = await getUserTeamInfo(
    event.user as string,
    client
  );

  const threadId = event.thread_ts || event.ts;
  const isRootMessage = event.thread_ts ? false : true;
  const teamId = event.team;
  const message = event.text.split(" ").slice(1).join(" ");

  try {
    const { athena_brain_id, athena_api_token } =
      await validateTeamAndAthenaInfo(teamId);

    if (isRootMessage) {
      const { response, chatId } = await createChat(
        athena_api_token,
        athena_brain_id,
        message
      );
      if (!chatId) throw new Error("Chat creation failed");

      await prisma.chats.create({
        data: { chat_id: chatId, team_id: teamId, thread_id: threadId },
      });

      await say({
        thread_ts: event.ts,
        text: response,
        mrkdwn: true,
        parse: "full",
      });
      return;
    }

    const chatInfo = await prisma.chats.findFirst({
      where: { thread_id: threadId },
    });

    if (!chatInfo || !chatInfo.chat_id)
      throw new Error("Chat info validation failed");

    const { response } = await getResponse(
      athena_api_token,
      chatInfo.chat_id,
      message
    );
    await say({
      thread_ts: event.ts,
      text: response,
      mrkdwn: true,
      parse: "full",
    });
  } catch (error: any) {
    console.log(error);

    if (error.message === "Validation failed") {
      await say({
        thread_ts: threadId,
        blocks: getSetConfigAppHome(is_admin),
      });
      return;
    }

    await say({
      thread_ts: threadId,
      text: "I'm sorry, I can't find your information. Please contact the administrator.",
    });
  }
};
