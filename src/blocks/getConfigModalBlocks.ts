import { KnownBlock } from "@slack/bolt";

export function getConfigModalBlocks(): KnownBlock[] {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "To connect your Athena account, you will need to provide the following information:",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "You can find your Brain ID and API Key in the Athena dashboard. For assistance, please refer https://docs.athenacopilot.ai/Authentication.",
      },
    },
    {
      type: "input",
      block_id: "username_input",
      label: {
        type: "plain_text",
        text: "User Id",
      },
      element: {
        type: "plain_text_input",
        action_id: "username",
      },
    },
    {
      type: "input",
      block_id: "api_key_input",
      label: {
        type: "plain_text",
        text: "API Key",
      },
      element: {
        type: "plain_text_input",
        action_id: "api_key",
      },
    },
    {
      type: "input",
      block_id: "brain_id_input",
      label: {
        type: "plain_text",
        text: "Brain ID",
      },
      element: {
        type: "plain_text_input",
        action_id: "brain_id",
      },
    },
  ];
}
