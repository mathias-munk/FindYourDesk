const chair = document.querySelector(".book");

// Create a client instance, we create a random id so the broker will allow multiple sessions

client = new Paho.MQTT.Client(
  "broker.mqttdashboard.com",
  8000,
  "clientId" + makeid(3)
);

// client = new Paho.MQTT.Client(
//   "broker.mqttdashboard.com",
//   8000,
//   "clientId123
// );

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({ onSuccess: onConnect });

function hiveSubscribe() {
  console.log("subscribed");
  client.subscribe("chair_booking");
}

function makeBooking() {
  console.log("makeBooking");
  client.subscribe("chair_booking");
  message = new Paho.MQTT.Message("Booked");
  message.destinationName = "chair_booking";
  chair.style.backgroundColor = "yellow";
  client.send(message);
}

function updateTable(payload) {
  var tr;
  tr = $("<tr/>");
  tr.append("<td>" + json[0].order_id + "</td>");
  tr.append("<td>" + json[1].status + "</td>");
  tr.append("<td>" + json[4].delivery_address + "</td>");
  $("table").append(tr);
}

// called when the client connects
function onConnect() {
  // Once a connection has been made report.
  console.log("Connected");
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  console.log("onMessageArrived:" + message.payloadString);
  if (message.payloadString == "Lunch") {
    chair.classList.add("amber");
  }
}

// called to generate the IDs
function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
