import { AllMiddlewareArgs, SlackEventMiddlewareArgs } from "@slack/bolt";
import { prisma } from "../app";
import { getSetConfigAppHome } from "../blocks/getSetConfigAppHome";
import { getConfiguredAppHome } from "../blocks/getConfiguredAppHome";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { getUserTeamInfo } from "../lib/getUserTeamInfo";

export const appHomeOpenedHandler = async (
  payload: SlackEventMiddlewareArgs<"app_home_opened"> &
    AllMiddlewareArgs<StringIndexed>
) => {
  const { event, client, logger } = payload;
  const user = event.user;

  const { team_id, is_admin } = await getUserTeamInfo(user, client);

  if (!team_id) {
    return;
  }

  const teamInfo = await prisma.teams.findFirst({
    where: { team_id: team_id },
  });

  if (!teamInfo) {
    const result = await client.views.publish({
      user_id: event.user,
      view: {
        // Home tabs must be enabled in your app configuration page under "App Home"
        type: "home",
        blocks: getSetConfigAppHome(is_admin || false),
      },
    });
    return;
  }

  try {
    const result = await client.views.publish({
      user_id: event.user,
      view: {
        type: "home",
        blocks: getConfiguredAppHome(),
      },
    });

    // logger.info(result);
  } catch (error) {
    logger.error(error);
  }
};
