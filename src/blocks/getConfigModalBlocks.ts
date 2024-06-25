import { KnownBlock } from "@slack/bolt";

export function getConfigModalBlocks(): KnownBlock[] {
  return [
    {
      type: "input",
      block_id: "username_input",
      label: {
        type: "plain_text",
        text: "Username",
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
