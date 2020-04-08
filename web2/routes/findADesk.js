const express = require("express");

const router = express.Router();

const Chair = require("../models/Chair");
const Room = require("../models/Room");

router.get("/", async (req, res) => {
  res.render("index");
});

router.get("/login", async (req, res) => {
  res.render("login");
});

router.get("/signup", async (req, res) => {
  res.render("signup");
});

router.get("/map", async (req, res) => {
  res.render("map");
});

router.get("/rooms", (req, res) => {
  res.send("room-router");
});

router.get("/chairs", (req, res) => {
  res.send("chair-router");
});

module.exports = router;
