const BACKEND_URL = "https://backend.athenacopilot.ai";

async function postRequest(
  url: string,
  apiToken: string,
  body: object
): Promise<Response> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: "Basic " + apiToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return response;
}

async function handleResponse(response: Response): Promise<any> {
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();

  const firstResponse = data[0];
  if (firstResponse.user_credits < 1) {
    throw new Error("Insufficient credits");
  }
  return firstResponse;
}

async function makeApiCall(
  endpoint: string,
  apiToken: string,
  body: object
): Promise<any> {
  const response = await postRequest(
    `${BACKEND_URL}${endpoint}`,
    apiToken,
    body
  );
  return handleResponse(response);
}

async function createChat(
  apiToken: string,
  brainId: string,
  message: string
): Promise<{ chatId: string; response: string }> {
  const body = {
    brain_ids: [brainId],
    name: "Slack Chat - " + new Date().toISOString(),
    message: message,
  };
  const firstResponse = await makeApiCall("/chat/new-chat", apiToken, body);
  return {
    chatId: firstResponse.thread_id,
    response: firstResponse.message,
  };
}

async function getResponse(
  apiToken: string,
  chatId: string,
  message: string
): Promise<{ chatId: string; response: string }> {
  const body = {
    chat_thread_id: chatId,
    text: message,
  };
  const firstResponse = await makeApiCall("/chat/get-response", apiToken, body);
  return {
    chatId: firstResponse.thread_id,
    response: firstResponse.message,
  };
}

export { createChat, getResponse };
