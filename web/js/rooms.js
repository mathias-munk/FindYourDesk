const container = document.querySelector(".map-container");
const overlay = document.querySelector(".room-overlay");
const chairContainer = document.querySelector(".chair-container");
const chairState = document.querySelector(".chair-state");

const blue = "linear-gradient(rgb(79, 117, 255), rgb(48, 75, 176))";
const amber = "linear-gradient(rgb(255, 188, 94), rgb(201, 145, 66))";
const red = "linear-gradient(rgb(245, 93, 93), rgb(171, 26, 26))";
const green = "linear-gradient(rgb(177, 255, 138), rgb(92, 138, 70))";

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
  client.subscribe("FindADesk");
}

function makeBooking() {
  const chair = document.querySelector(".book");
  console.log("makeBooking");
  client.subscribe("FindADesk");
  var r = confirm("Do you want to book this chair?");
  if (r == true) {
    message = new Paho.MQTT.Message("Booked");
    message.destinationName = "FindADesk";
    client.send(message);
    chair.style.backgroundImage = amber;
    chair.disabled = true;
    chair.classList.remove("book_hover");
  }
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
  var data = JSON.parse(message.payloadString);
  let rooms = data.rooms;
  rooms = rooms.map(room => {
    const id = room.id;
    const name = room.name;
    const tables = room.tables;
    const state = room.state;
    const available = room.available;
    return { id, name, tables, state, available };
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
    <div class="room-button" >
      <div class="room-container green" data-id=${room.id}>
        <p class="room">${room.name}</p>
        <p class="capacity">Available Chairs: ${room.available}</p>
      </div>
    </div>
    `;
  });
  container.innerHTML = result;
  const buttons = [...document.querySelectorAll(".room-container")];
  buttons.forEach(button => {
    let id = button.dataset.id;
    var roomClick = rooms.find(room => room.id == id);
    setRoomState(roomClick.available, button);
    button.addEventListener("click", event => {
      createTables(roomClick.tables, roomClick.state);
    });
  });
}

function createTables(number, state) {
  if (number == null) {
    number = 1;
  }
  for (i = 0; i < number; i++) {
    if (i == 0) {
      chairContainer.innerHTML = `
      <article class="table-group">
        <div class="chair-group">
          <div class="chair">
            <div class="chair-state">Occupied</div>
          </div>
          <div class="chair bottom">
            <div class="chair-state">Occupied</div>
          </div>
        </div>
        <div class="table"></div>
        <div class="chair-group">
          <div class="chair">
            <div class="chair-state">Occupied</div>
          </div>
          <button
            onclick="makeBooking()"
            class="chair bottom green book book_hover"
          >
            <div class="chair-state">${state}</div>
          </button>
        </div>
      </article>
      `;
    } else {
      chairContainer.innerHTML += `
      <article class="table-group">
        <div class="chair-group">
          <div class="chair">
            <div class="chair-state">Occupied</div>
          </div>
          <div class="chair bottom">
            <div class="chair-state">Occupied</div>
          </div>
        </div>
        <div class="table"></div>
        <div class="chair-group">
          <div class="chair">
            <div class="chair-state">Occupied</div>
          </div>
          <div class="chair bottom">
            <div class="chair-state">Occupied</div>
          </div>
        </div>
      </article>
      `;
    }
  }
  overlay.classList.add("showOverlay");
  const closeIcon = document.querySelector(".close-room");
  closeIcon.addEventListener("click", () => {
    overlay.classList.remove("showOverlay");
  });
  setChairState(state);
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

function setRoomState(number, room) {
  if (number < 5) {
    room.style.backgroundImage = red;
    return;
  }
  if (number < 20) {
    room.style.backgroundImage = amber;
    return;
  }
  room.style.backgroundImage = green;
}
