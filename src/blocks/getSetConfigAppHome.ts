import { KnownBlock } from "@slack/bolt";

export function getSetConfigAppHome(is_admin: boolean) {
  const blocks: KnownBlock[] = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Welcome to Athena!* :wave:",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Great to see you here! Athena is a chatbot that can help you with your queries.",
      },
    },
  ];

  if (is_admin) {
    blocks.push(
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "But before you can do that, we need you to configure the bot. Simply click the button below to configure it:",
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            action_id: "connect_account_button",
            text: {
              type: "plain_text",
              text: "Connect account",
              emoji: true,
            },
            value: "connect_account",
          },
        ],
      }
    );
  } else {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: "You need to be an admin to configure Athena.",
      },
    });
  }

  return blocks;
}
