const container = document.querySelector(".map-container");

// local storage
class Storage {
  static saveRooms(roomList) {
    localStorage.setItem("rooms", JSON.stringify(roomList));
  }
  static saveNumber(number) {
    localStorage.setItem("amount_tables", JSON.stringify(number));
  }
  static saveState(state) {
    localStorage.setItem("state", state);
  }
  static getNumber() {
    return localStorage.getItem("amount_tables");
  }
  static getState() {
    return localStorage.getItem("state");
  }
  static getRooms() {
    return localStorage.getItem("rooms");
  }
}

var rooms = Storage.getRooms();
createRooms(rooms);

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

function makeBooking() {
  const chair = document.querySelector(".book");
  console.log("makeBooking");
  client.subscribe("chair_booking");
  message = new Paho.MQTT.Message("Booked");
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
  let rooms = data.rooms;
  rooms = rooms.map(room => {
    const id = room.id;
    const name = room.name;
    const tables = room.tables;
    const state = room.state;
    return { id, name, tables, state };
  });
  Storage.saveRooms(rooms);
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

function createRooms(rooms) {
  if (rooms == null) {
    return;
  }
  rooms = JSON.parse(rooms);
  let result = "";
  rooms.forEach(room => {
    result += `
    <a href="chairs.html" data-id=${room.id}>
      <div class="room-container green">
        <p class="room">${room.name}</p>
        <p class="capacity">Available Chairs: 50</p>
      </div>
    </a>
    `;
  });
  container.innerHTML = result;
}
