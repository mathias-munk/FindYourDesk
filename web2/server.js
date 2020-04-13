const express = require("express");
const app = express();
const port = 5000;
const router = require("./routes/findADesk");
const mongoose = require("mongoose");
const expressLayouts = require("express-ejs-layouts");

// -----SET VIEW ENGINE-----
app.set("view engine", "ejs");

// Tells the app where views folder is (So dont have to keep typing /views/file)
app.set("views", __dirname + "/views");

// sets the 'layout' (i.e. the html template which contains header, footer etc) to the layout file in layouts folder
app.set("layout", "layouts/layout");
app.use(expressLayouts);

// tells express where our public files will be (i.e. in a folder called public)
app.use(express.static(__dirname + "/public"));

// -----CONNECT TO DATABASE-----
mongoose.connect("mongodb://localhost/FindADesk", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// good to have these towards the bottom, to ensure other things are loaded before attempting to use them
app.use("/", router);

const server = app.listen(port, () => {
  console.log("Listening on port " + port);
});
