import {
  AllMiddlewareArgs,
  SlackViewAction,
  SlackViewMiddlewareArgs,
} from "@slack/bolt";
import { prisma } from "../app";
import { getConfiguredAppHome } from "../blocks/getConfiguredAppHome";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { base64EncodeForBasicAuth } from "../lib/base64ForBasicAuth";
import { WebClient } from "@slack/web-api";
import { PrivateMetadata } from "./connectAccountButtonHandler";

async function createTeam(
  userConfig: {
    brain_id: string;
    api_key: string;
    username: string;
    team_id: string;
    user_id: string;
  },
  client: WebClient,
  channel_id: string
) {
  try {
    await prisma.teams.create({
      data: {
        team_id: userConfig.team_id,
        athena_brain_id: userConfig.brain_id,
        athena_api_token: base64EncodeForBasicAuth(
          userConfig.username,
          userConfig.api_key
        ),
        user_id: userConfig.user_id,
      },
    });
  } catch (error) {
    console.error("Failed to create team:", error);

    if (channel_id) {
      await client.chat.postMessage({
        channel: channel_id,
        text: "Failed to create team. Please try again.",
      });
      return;
    }

    await client.views.publish({
      user_id: userConfig.user_id,
      view: {
        type: "home",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Failed to create team. Please try again.",
            },
          },
        ],
      },
    });
    return;
  }
}

export const configModalFormHandler = async (
  payload: SlackViewMiddlewareArgs<SlackViewAction> &
    AllMiddlewareArgs<StringIndexed>
) => {
  const { ack, body, view, client } = payload;

  await ack();

  const result = view.state.values;

  const private_metadata = JSON.parse(view.private_metadata) as PrivateMetadata;
  const team_id = body.team?.id || body.enterprise?.id;

  const userConfig = {
    brain_id: result.brain_id_input.brain_id.value || "",
    api_key: result.api_key_input.api_key.value || "",
    username: result.username_input.username.value || "",
    team_id: team_id || "",
    user_id: private_metadata.user_id,
  };

  if (!userConfig.brain_id || !userConfig.api_key || !userConfig.username) {
    await client.views.publish({
      user_id: private_metadata.user_id,
      view: {
        type: "home",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: "Please fill all the fields to continue.",
            },
          },
        ],
      },
    });
    return;
  }

  await createTeam(userConfig, client, private_metadata.channel_id);

  if (private_metadata.channel_id) {
    await client.chat.postMessage({
      channel: private_metadata.channel_id,
      text: "Team added successfully.",
    });
  }

  await client.views.publish({
    user_id: private_metadata.user_id,
    view: {
      type: "home",
      blocks: getConfiguredAppHome(),
    },
  });
};
