const axios = require("axios");
const express = require("express");
const line = require("@line/bot-sdk");
const PORT = process.env.PORT || 3000;

const config = {
  channelSecret: "2492e70d27c1f9e5764206d23804a08c",
  channelAccessToken:
    "ECHSy+5KSQTlSbqz1akJwGTcdkIOeBq2YI1XYFfumhZhDu1SG2EW+PkmjH/iTDBolKNwd1UfcwDTkKhhqu69SWGx/lC2eV0E+oMbSLfHZOSVqeY3eWKD6C+GGQ+Md1A7mVqAXOlYlBSSYYxaFJ4sfgdB04t89/1O/w1cDnyilFU=",
};

const app = express();

app.get("/", (req, res) => res.send("Hello LINE BOT!(GET)"));
app.post("/webhook", line.middleware(config), (req, res) => {
  console.log(req.body.events);

  Promise.all(req.body.events.map(handleEvent)).then((result) =>
    res.json(result)
  );
});

const client = new line.Client(config);

async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    return Promise.resolve(null);
  }

  if (event.message.text !== "天気を教えて") {
    return client.replyMessage(event.replyToken, {
      type: "text",
      text: "天気を教えてと言ってね",
    });
  }

  let replyText = "";
  replyText = "ちょっと待ってね";
  await client.replyMessage(event.replyToken, {
    type: "text",
    text: replyText,
  });

  const CITY_ID = `130010`;
  const URL = `http://weather.livedoor.com/forecast/webservice/json/v1?city=${CITY_ID}`;
  const res = await axios.get(URL);
  const pushText = res.data.description.text;
  return client.pushMessage(event.source.userId, {
    type: "text",
    text: pushText,
  });
}

process.env.NOW_REGION ? (module.exports = app) : app.listen(PORT);
console.log(`Server running at ${PORT}`);
