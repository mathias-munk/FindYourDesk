const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  buildingId: {
    type: Number,
    required: true
  },
  buildingName: {
    type: String,
    required: true
  },
  roomId: {
    type: Number,
    required: true
  },
  roomName: {
    type: String,
    required: true
  },
  tables: {
    type: Number,
    required: true
  }
});

// First argument is the name of the model, second argument is the schema itself
module.exports = mongoose.model("Room", roomSchema);
