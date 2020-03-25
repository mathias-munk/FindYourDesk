var amountTables = 1;
var state = "Free";

// Create a client instance, we create a random id so the broker will allow multiple sessions

client = new Paho.MQTT.Client(
  "broker.mqttdashboard.com",
  8000,
  "clientId" + makeid(3)
);

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({ onSuccess: onConnect });

function hiveSubscribe() {
  console.log("Subscribed");
  client.subscribe("chair_booking");
}

// called when the client connects
function onConnect() {
  // Once a connection has been made report.
  console.log("Connected");
  hiveSubscribe();
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
  var data = JSON.parse(message.payloadString);
  amountTables = data.amount_tables;
  state = data.state;
  Storage.saveNumber(amountTables);
  Storage.saveState(state);
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

// local storage
class Storage {
  static saveNumber(number) {
    localStorage.setItem("amount_tables", JSON.stringify(number));
  }
  static saveState(state) {
    localStorage.setItem("state", state);
  }
}
