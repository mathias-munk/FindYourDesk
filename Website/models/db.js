const mongoose = require("mongoose");

const chairSchema = new mongoose.Schema({
  chairId: {
    type: Number,
    required: true
  },
  state: {
    type: String,
    require: true
  }
});

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
  },
  chairs: {
    type: [chairSchema],
    default: undefined
  },
  freeChairs: {
    type: Number,
    required: true
  }
});

const Room = mongoose.model("Room", roomSchema);
const Chair = mongoose.model("Chair", chairSchema);
// First argument is the name of the model, second argument is the schema itself
module.exports = {
  Room: Room,
  Chair: Chair
};
