import { WebClient } from "@slack/web-api";

export async function getUserTeamInfo(
  user: string,
  client: WebClient
): Promise<{ team_id: string; is_admin: boolean }> {
  try {
    const userInfo = await client.users.info({
      user,
    });

    if (!userInfo.user) {
      throw new Error("User info not found");
    }

    let { team_id, is_admin } = userInfo.user;
    if (!team_id) {
      throw new Error("Team info not found");
    }
    if (is_admin === undefined) {
      is_admin = false;
    }
    return { team_id, is_admin };
  } catch (error) {
    console.error("Failed to get user team info", error);
    throw error; // Rethrow to handle it in the calling function
  }
}
