const chair = document.querySelector(".book");
const chairGrid = document.querySelector(".chair-container");

const blue = "linear-gradient(rgb(79, 117, 255), rgb(48, 75, 176))";
const amber = "linear-gradient(rgb(255, 188, 94), rgb(201, 145, 66))";
const red = "linear-gradient(rgb(245, 93, 93), rgb(171, 26, 26))";
const green = "linear-gradient(rgb(177, 255, 138), rgb(92, 138, 70))";

// local storage
class Storage {
  static saveNumber(number) {
    localStorage.setItem("tables", JSON.stringify(number));
  }
  static saveState(state) {
    localStorage.setItem("state", state);
  }
  static getNumber() {
    return localStorage.getItem("tables");
  }
  static getState() {
    return localStorage.getItem("state");
  }
}

var amountTables = Storage.getNumber();
var state = Storage.getState();

// Create a client instance, we create a random id so the broker will allow multiple sessions

client = new Paho.MQTT.Client(
  "broker.mqttdashboard.com",
  8000,
  "clientId" + makeid(3)
);

createTables(amountTables);
setChairState(state);

// set callback handlers
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

// connect the client
client.connect({ onSuccess: onConnect });

function hiveSubscribe() {
  console.log("Subscribed");
  client.subscribe("chair_booking");
}

function makeBooking() {
  const chair = document.querySelector(".book");
  console.log("makeBooking");
  client.subscribe("chair_booking");
  message = new Paho.MQTT.Message(`{
    "state": "Booked"
  }`);
  message.destinationName = "chair_booking";
  client.send(message);
  chair.style.backgroundImage = amber;
  chair.disabled = true;
  chair.classList.remove("book_hover");
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
  // var chair = document.querySelector(".book");
  console.log("onMessageArrived:" + message.payloadString);
  var data = JSON.parse(message.payloadString);
  amountTables = data.tables;
  state = data.state;
  Storage.saveNumber(amountTables);
  Storage.saveState(state);
  createTables(amountTables);
  setChairState(state);
}

function createTables(number) {
  if (number == null) {
    number = 1;
  }
  for (i = 0; i < number; i++) {
    if (i == 0) {
      chairGrid.innerHTML = `
      <article class="table-group">
        <div class="chair-group">
          <div class="chair"></div>
          <div class="chair bottom"></div>
        </div>
        <div class="table"></div>
        <div class="chair-group">
          <div class="chair"></div>
          <button
            onclick="makeBooking()"
            class="chair bottom green book book_hover"
          ></button>
        </div>
      </article>
      `;
    } else {
      chairGrid.innerHTML += `
      <article class="table-group">
        <div class="chair-group">
          <div class="chair"></div>
          <div class="chair bottom"></div>
        </div>
        <div class="table"></div>
        <div class="chair-group">
          <div class="chair"></div>
          <div class="chair bottom"></div>
        </div>
      </article>
      `;
    }
  }
}

function setChairState(state) {
  var chair = document.querySelector(".book");
  if (state == "Lunch") {
    chair.style.backgroundImage = blue;
    return;
  }
  if (state == "Booked") {
    chair.style.backgroundImage = amber;
    return;
  }
  if (state == "Occupied") {
    chair.style.backgroundImage = red;
    return;
  }
  if (state == "Free") {
    chair.style.backgroundImage = green;
    chair.disabled = false;
    // Consider removing book_hover (as will throw an error if removed and not already present.)
    chair.classList.add("book_hover");
    return;
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
