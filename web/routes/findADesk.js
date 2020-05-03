const express = require("express");
const router = express.Router();
const mqtt = require("mqtt");

const db = require("../models/db");

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
  if (topic == "FindADesk_StackToWeb") {
    updateChairState(message.toString());
    console.log("Received from stack");
  }
  if (topic == "FindADesk_ProcessingToWeb") {
    updateRoomState(message.toString());
  }
});

// -----ROUTES-----

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/login", (req, res) => {
  res.render("login");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

// Map page
router.get("/map", async (req, res) => {
  try {
    // find every building (but just once)
    let buildingList = await db.Room.collection.distinct("buildingName");
    res.render("map", { buildingList: buildingList });
  } catch (err) {
    console.log(err);
    res.redirect("/");
  }
});

// Building page which lists all rooms in that building.
router.get("/buildings/:name", async (req, res) => {
  try {
    // find every building (but just once)
    let buildingList = await db.Room.collection.distinct("buildingName");
    // find all rooms within the selected building.
    const rooms = await db.Room.find({
      buildingName: req.params.name
    });
    // Loop through each room, counting the number of free chairs in that room
    // Have to use regular for loop so that we can use await.save() inside the loop
    for (let room of rooms) {
      let freeChairs = 0;
      room.chairs.forEach(chair => {
        if (chair.state == "free") {
          freeChairs++;
        }
      });
      room.freeChairs = freeChairs;
      await room.save();
    }
    res.render("building", { rooms: rooms, buildingList: buildingList });
  } catch (err) {
    console.log(err);
    res.redirect("/map");
  }
});

// Room page which displays tables and chairs in that room.
router.get("/room/:id", async (req, res) => {
  try {
    // find every building (but just once)
    let buildingList = await db.Room.collection.distinct("buildingName");
    // Get the correct room from the params
    const room = await db.Room.findById(req.params.id);
    res.render("room", { room: room, buildingList: buildingList });
  } catch {
    res.redirect("/map");
  }
});

// Room page which displays tables and chairs in that room.
router.post("/room", async (req, res) => {
  try {
  } catch {
    res.redirect("/map");
  }
});

router.get("/book/:roomId/:chairId", async function(req, res) {
  try {
    // find every building (but just once) for the sidebar
    let buildingList = await db.Room.collection.distinct("buildingName");
    // find the room object
    let room = await db.Room.findOne({ _id: req.params.roomId });
    // get the chair object
    let chair = await room.chairs[req.params.chairId];
    // Change state of chair to booked
    if (chair.state == "free") {
      chair.state = "booked";
      await room.save();
      // Send message to MQTT
      messageStack(chair.chairId, room.roomId, room.buildingId);
    }

    // Reload the page
    res.render("room", { room: room, buildingList: buildingList });
  } catch (err) {
    console.log(err);
  }
});

function messageStack(chairId, roomId, buildingId) {
  let string = `{ "buildingId": ${buildingId}, "roomId": ${roomId}, "chairId": ${chairId} } "state": "booked" }`;
  client.publish("FindADesk_WebToStack", string);
}

async function updateRoomState(string) {
  try {
    const roomObjects = JSON.parse(string);
    const roomArray = roomObjects.rooms;
    for (const roomObject of roomArray) {
      let room = await db.Room.findOne({
        roomId: roomObject.roomId,
        buildingId: roomObject.buildingId
      });
      if (room != null) {
        const chairArray = createChairArray(roomObject.tables);
        // Update the old room with the new data
        room.buildingId = roomObject.buildingId;
        room.buildingName = roomObject.buildingName;
        room.roomId = roomObject.roomId;
        room.roomName = roomObject.roomName;
        room.tables = roomObject.tables;
        room.chairs = chairArray;
        // 4 chairs per table. When a room is changed/updated all chairs reset to free.
        room.freeChairs = roomObject.tables * 4;
      } else {
        const chairArray = createChairArray(roomObject.tables);
        // Create a new room with the data
        room = new db.Room({
          buildingId: roomObject.buildingId,
          buildingName: roomObject.buildingName,
          roomId: roomObject.roomId,
          roomName: roomObject.roomName,
          tables: roomObject.tables,
          chairs: chairArray,
          freeChairs: roomObject.tables * 4
        });
      }
      await room.save();
      console.log("Room saved");
    }
  } catch (err) {
    console.log(err);
  }
}

function createChairArray(tables) {
  let newChair;
  let chairArray = [];
  let chairs = tables * 4;
  for (let i = 0; i < chairs; i++) {
    newChair = new db.Chair({
      chairId: i,
      state: "free"
    });
    chairArray.push(newChair);
  }
  return chairArray;
}

async function deleteRoom(string) {
  const roomObject = JSON.parse(string);
  let room;
  try {
    room = await db.Room.findOne({
      roomId: roomObject.roomId,
      buildingId: roomObject.buildingId
    });
    if (room != null) {
      await room.remove();
    } else {
      console.log("That room does not exist.");
    }
  } catch {
    res.send("Something went wrong");
  }
}

// Reads JSON object from stack and updates chair state
async function updateChairState(string) {
  const chairObject = JSON.parse(string);
  let chair;
  try {
    // Search for room with the buildingId and roomId
    room = await db.Room.findOne({
      roomId: chairObject.roomId,
      buildingId: chairObject.buildingId
    });
    // Building and room exist
    if (room != null) {
      // Check if reading array out of bounds (i.e. chair doesnt exist)
      if (typeof room.chairs[chairObject.chairId] === "undefined") {
        console.log("That chair does not exist");
      } else {
        room.chairs[chairObject.chairId].state = chairObject.state;
        await room.save();
      }
    } else {
      console.log("That room does not exist.");
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = router;
