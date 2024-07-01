# Athena Copilot Slack Bot

This Slack bot integrates Athena Copilot's capabilities directly into your Slack workspace, allowing you to interact with your knowledge base (Brain) seamlessly.

## Features

- Chat with your Brain directly in Slack channels
- Retrieve information from your knowledge base quickly
- Continuous conversation in threads
- Easy setup and configuration

## Installation

To add Athena Copilot to your Slack workspace, visit:

[https://get-slack.athenacopilot.ai/slack/install](https://get-slack.athenacopilot.ai/slack/install)

## Setup

After installation, an admin needs to set up the bot. This can be done either through the app home or by sending a message in a channel where the bot is present.

1. You'll need your User ID and API Key. Follow the instructions at [https://docs.athenacopilot.ai/Authentication](https://docs.athenacopilot.ai/Authentication) to obtain these.

2. You'll also need a Brain UUID. To get this, open the brain page in Athena Copilot and copy the last part of the URL. For example, from `https://app.athenacopilot.ai/brain/bc4828ef-f17d-4269-9b9b-dd2103281bf4`, the Brain UUID would be `bc4828ef-f17d-4269-9b9b-dd2103281bf4`.

3. Follow the prompts in Slack to enter this information and complete the setup.

## Usage

Once set up, you can interact with Athena Copilot in any channel where it's been added:

1. Start a new conversation by mentioning the bot. For example: `@Athena Copilot what is react?`
2. The bot will create a thread with its response.
3. Continue the conversation by replying in the thread and mentioning the bot again.
4. To start a new conversation, simply send a new message in the channel mentioning the bot.
   

## Development Setup

If you're looking to contribute or run your own instance, follow these steps:

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up your environment variables (see below)
4. Set up the database:
   - Make sure your `DATABASE_URL` is set correctly in the `.env` file
   - Run `npx prisma generate` to generate Prisma client
   - Run `npx prisma db push` to create the database tables based on the Prisma schema
5. Build the project: `pnpm run build`
6. Start the bot: `pnpm run start`

For development, you can use: `pnpm run dev`


### Environment Variables

Create a `.env` file with the following variables:

```
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_STATE_SECRET=
NGROK_AUTH_TOKEN=
NGROK_HOSTNAME=
PORT=
NODE_ENV="development"
DATABASE_URL=
```


### Database Setup

This project uses Prisma as an ORM. The Prisma schema is already included in the project. To set up your database:

1. Ensure your `DATABASE_URL` is correctly set in the `.env` file.
2. Run `npx prisma generate` to generate the Prisma client.
3. Run `npx prisma db push` to create the database tables based on the Prisma schema.

If you need to make changes to the database schema, update the `prisma/schema.prisma` file and run `npx prisma db push` again.


### Slack App Manifest

Use this manifest when creating your Slack app (replace placeholders with your actual values):

```json
{
  "display_information": {
    "name": "Athena Copilot",
    "description": "Enterprise Search Powered by Gen AI",
    "background_color": "#514287"
  },
  "features": {
    "app_home": {
      "home_tab_enabled": true,
      "messages_tab_enabled": false,
      "messages_tab_read_only_enabled": true
    },
    "bot_user": {
      "display_name": "Athena Copilot",
      "always_online": true
    }
  },
  "oauth_config": {
    "redirect_urls": ["https://{your-domain}/slack/oauth_redirect"],
    "scopes": {
      "bot": [
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
        "reactions:write"
      ]
    }
  },
  "settings": {
    "event_subscriptions": {
      "request_url": "https://{your-domain}/slack/events",
      "bot_events": [
        "app_home_opened",
        "app_mention",
        "message.channels",
        "message.groups",
        "reaction_added"
      ]
    },
    "interactivity": {
      "is_enabled": true,
      "request_url": "https://{your-domain}/slack/events"
    },
    "org_deploy_enabled": true,
    "socket_mode_enabled": false,
    "token_rotation_enabled": false
  }
}
```

Replace {your-domain} with your actual domain or ngrok URL when setting up the app.

## Contributing

We welcome contributions! Please see our contributing guidelines for more information.

# Todos

- [ ] add auth middleware

- [ ] make modal use brains list
