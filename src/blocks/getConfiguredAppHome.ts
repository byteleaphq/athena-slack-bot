import { KnownBlock } from "@slack/bolt";

export function getConfiguredAppHome(): KnownBlock[] {
  return [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "*Welcome to Athena!* :tada: \n\nAthena is a chatbot that can help you with your queries. Your app is configured correctly. Just mention me in a channel and ask your question. ",
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Learn more about Athena at [Athena](https://athenacopilot.ai/) ",
      },
    },
  ];
}
