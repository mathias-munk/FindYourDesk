const mongoose = require("mongoose");

const chairSchema = new mongoose.Schema({
  chairId: {
    type: Number,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  room: {
    // tells mongoose to reference another object inside our collections
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // referencing the 'Room' collection
    ref: "Room"
  }
});

// First argument is the name of the model, second argument is the schema itself
module.exports = mongoose.model("Chair", chairSchema);
