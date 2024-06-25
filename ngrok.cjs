const ngrok = require("ngrok");
require("dotenv").config();

let url = null;

async function startNgrok() {
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  url = await ngrok.connect({
    addr: port,
    log_level: "info",
    hostname: "renewed-mudfish-fairly.ngrok-free.app",
    authtoken: process.env.NGROK_AUTH_TOKEN,
    onStatusChange: (status) => {
      console.log("ngrok tunnel status changed", status);
    },
  });
  console.log("⚡️ Bolt app is running at " + url);
}

async function stopNgrok() {
  if (url) {
    log("Disconnecting ngrok");
    await ngrok.disconnect(url);
    url = null;
  }
}

const args = process.argv.slice(2);
console.log(args[0]);
switch (args[0]) {
  case "startNgrok":
    startNgrok();
    break;
  // case "stopNgrok":
  //   stopNgrok();
  //   break;
  // case "restartNgrok":
  //   restartNgrok();
  //   break;
  default:
    console.log("Invalid command");
    break;
}
