import {
  SlackAction,
  SlackActionMiddlewareArgs,
  AllMiddlewareArgs,
} from "@slack/bolt";
import { getConfigModalBlocks } from "../blocks/getConfigModalBlocks";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";

export type PrivateMetadata = {
  user_id: string;
  channel_id: string; // empty if the action was triggered from app home
};

export const connectAccountButtonHandler = async (
  payload: SlackActionMiddlewareArgs<SlackAction> &
    AllMiddlewareArgs<StringIndexed>
) => {
  // Acknowledge the action
  const { ack, body, client, say } = payload;
  await ack();

  let trigger_id = "";

  if (body.type === "block_actions") {
    trigger_id = body.trigger_id;
  } else {
    await say("Please click the button to connect your account.");
  }

  // will be used to send a message to the user. undefined if the action was triggered from app home
  const channel_id = body.channel?.id;

  const private_metadata: PrivateMetadata = {
    user_id: body.user.id,
    channel_id: channel_id ? channel_id : "",
  };

  try {
    const result = await client.views.open({
      trigger_id: trigger_id,

      view: {
        type: "modal",
        callback_id: "config_form",
        private_metadata: JSON.stringify(private_metadata),
        title: {
          type: "plain_text",
          text: "Configure Athena",
        },
        blocks: getConfigModalBlocks(),
        submit: {
          type: "plain_text",
          text: "Submit",
        },
      },
    });
  } catch (error) {
    console.error(error);
  }
};
