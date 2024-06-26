export function base64EncodeForBasicAuth(username: string, password: string) {
  return Buffer.from(`${username}:${password}`).toString("base64");
}
export function base64DecodeForBasicAuth(encodedString: string) {
  const decodedString = Buffer.from(encodedString, "base64").toString("utf-8");
  const [username, password] = decodedString.split(":");
  return { username, password };
}
