const mongoose = require("mongoose");

const chairSchema = new mongoose.Schema({
  chairId: {
    type: Number,
    required: true
  },
  state: {
    type: String,
    required: true
  }
});

// First argument is the name of the model, second argument is the schema itself
module.exports = mongoose.model("Chair", chairSchema);
