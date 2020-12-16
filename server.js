const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const Pusher = require("pusher");

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("./"));

const pusher = new Pusher({
  app_id: "1123794",
  key: "51f141add7a2e1e3715f",
  secret: "3f14fdb143f549db3bd1",
  cluster: "ap2",
});

app.post("/pusher/auth", (req, res) => {
  console.log(req.body);
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const user_id = req.cookies.user_id;

  const presenceData = { user_id };
  const auth = pusher.authenticate(socketId, channel, presenceData);
  res.send(auth);
});

const port = process.env.PORT || 3000;
app.listen(port, (req, res) => {
  console.log("Server listening on port", port);
});
