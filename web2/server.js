const express = require("express");
const app = express();
const port = 5000;
const router = require("./routes/findADesk");
const mongoose = require("mongoose");
const mqtt = require("mqtt");
const expressLayouts = require("express-ejs-layouts");

// Tells the app where views folder is (So dont have to keep typing /views/file)
app.set("views", __dirname + "/views");

// sets the 'layout' (i.e. the html template which contains header, footer etc) to the layout file in layouts folder
app.set("layout", "layouts/layout");
app.use(expressLayouts);

// tells express where our public files will be (i.e. in a folder called public)
app.use(express.static("public"));

// -----CONNECT TO DATABASE-----
mongoose.connect("mongodb://localhost/FindADesk", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// -----CONNECT TO MQTT-----
const client = mqtt.connect("mqtt://broker.mqttdashboard.com");
// The web app needs 3 subscriptions.
// 1. For publishing information to the stack
// 2. For subscribing to information from the stack
// 3. For subscribing to information from the desktop (processing)
client.on("connect", async () => {
  console.log("Connected to MQTT.");
  try {
    await client.subscribe("FindADesk_WebToStack");
    console.log("Ready to publish to stack.");
    await client.subscribe("FindADesk_StackToWeb");
    console.log("Ready to receive from stack.");
    await client.subscribe("FindADesk_ProcessingToWeb");
    console.log("Ready to receive from desktop.");
  } catch (err) {
    console.log(err);
  }
});

// -----MQTT MESSAGE HANDLER-----
client.on("message", function(topic, message) {
  console.log(message.toString());
  if (topic == "FindADesk_WebToStack") {
    console.log("Published to stack");
  }
  if (topic == "FindADesk_StackToWeb") {
    console.log("Received from stack");
  }
  if (topic == "FindADesk_ProcessingToWeb") {
    console.log("Received from processing");
  }
});

// -----SET VIEW ENGINE-----
app.set("view engine", "ejs");

// good to have these towards the bottom, to ensure other things are loaded before attempting to use them
app.use("/", router);

const server = app.listen(port, () => {
  console.log("Listening on port " + port);
});
