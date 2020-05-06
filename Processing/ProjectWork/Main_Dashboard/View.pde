int list_spacing = 0;
int vert_margin_spacing = 70;
int horiz_margin_spacing = 70;
int list_x_size = 100;
int list_y_size = 200;
Character c;
ArrayList<String> Buildings = new ArrayList<String>();
ArrayList<String> Rooms = new ArrayList<String>();

Building currentBuilding;

public class Dashboard_view {
  int currentRoom = 0;    
  int listOneSelection = -1;
  int listTwoSelection = -1;
  int button_state = 0;
  int publish_state = 0;

  void build_list(String list_name, ArrayList<String> items) {

    ScrollableList list = cp5.addScrollableList(list_name)
      .setPosition(( horiz_margin_spacing) + list_spacing, vert_margin_spacing)
      .setSize(list_x_size, list_y_size);
    list.setBackgroundColor(color(190));
    list.setItemHeight(20);
    list.setBarHeight(40);
    list.setColorBackground(color(60));
    list.setColorActive(color(255, 128));
    list_spacing = list_spacing + list_x_size + 10;
    list.clear();
    list.setLabel(list_name + " ");
    list.open();
    int i = 0;
    for (String S : items) {
      list.addItem(S, i);
      i = i +1;
    }
  }
  void build_textEntry(String name, int x, int y) {
    Textfield textEntry = cp5.addTextfield(name).setPosition(x, y).setSize(200, 25).setText("Add A button");
    textEntry.clear();
    textEntry.setColorBackground(color(50));
    ControlFont cf1 = new ControlFont(createFont("Arial", 20));
    textEntry.setFont(cf1);
  }

  void build_metric(String name, int value, int x, int y) {
    cp5.addNumberbox(name)
      .setValue(value)
      .setPosition(x, y)
      .setSize(60, 20);
  }
}

  
void resetDashboard(){
  Rooms.clear();
  cp5.remove("Buildings");
  cp5.remove("Rooms");
  cp5.remove("Publish");
  cp5.remove("request");
  cp5.remove("Add new Building");
  cp5.remove("Add new Room");
   list_spacing = 0;
   vert_margin_spacing = 70;
   horiz_margin_spacing = 70;
   list_x_size = 100;
   list_y_size = 200;
   view.button_state = 0;
   view.publish_state = 0;
}

void updateDashboard() {
  surface.setTitle("Stack Delivery Management Dashboard");
  resetDashboard();
  view.build_list("Buildings", Buildings);
  view.build_list("Rooms", Rooms);
  cp5.addButton("Publish")
    .setValue(0)
    .setPosition(500, 150)
    .setSize(150, 34);
    cp5.addButton("request")
    .setValue(0)
    .setPosition(500, 200)
    .setSize(150, 34);
  view.build_textEntry("Add new Building", 450, 50);
}

int countTotalBroken() {
  int result = 0;

  for (Building b : buildingList) {
    result += b.brokenInBuilding();
  }

  return result;
}


void Buildings(int n) {
  view.listOneSelection=n;
}

void Rooms(int n) {
  view.listTwoSelection=n;
  cp5.addButton("addTable")
    .setValue(0)
    .setPosition(800, 150)
    .setSize(150, 34);     

  cp5.addButton("removeTable")
    .setValue(0)
    .setPosition(800, 200)
    .setSize(150, 34);       
  view.button_state = view.button_state +1;
  view.currentRoom = 1;
}
void controlEvent(ControlEvent theEvent) {
  
  String label = theEvent.getController().getLabel();
  String valueLabel = theEvent.getController().getValueLabel().getText();
  
  if (label.equals("Buildings ") || Buildings.contains(label)) {
    if(buildingList.size() == 0){
      return;
    }
    
    currentBuilding = buildingList.get(view.listOneSelection);
    println("hellohello");
    Rooms.clear();
    
    Rooms.addAll(buildingList.get(view.listOneSelection).returnRoomNames());
    cp5.remove("Broken in Current Building");
    cp5.remove("Add new Room");
    view.build_textEntry("Add new Room", 700, 50);
    view.build_metric("Broken in Current Building", buildingList.get(view.listOneSelection).brokenInBuilding(), 350, 105);
    if (list_spacing > list_x_size + 10) {
      list_spacing = list_spacing - list_x_size -10;
    }
    cp5.remove("Rooms");
    view.build_list("Rooms", Rooms);
    cp5.remove("addTable");
    cp5.remove("removeTable");
  }

  println(view.listOneSelection);
  if (label.equals("Add new Room")) {
    buildingList.get(view.listOneSelection).setRoom(new Room(valueLabel, 1, view.listOneSelection, buildingList.get(view.listOneSelection).Rooms.size()));
    cp5.remove("Rooms");
    Rooms.clear();
    Rooms.addAll(buildingList.get(view.listOneSelection).returnRoomNames());
    list_spacing = list_spacing - list_x_size -10;
    view.build_list("Rooms", Rooms);
  }
  if (label.equals("Add new Building")) {
    buildingList.add(new Building(valueLabel, buildingList.size() -1)); 
    cp5.remove("Rooms");
    Buildings.add(valueLabel);
    updateDashboard();
  }

  if (label.equals("Disconnect From Broker")) {
    client.disconnect();
    println("Disconnected From Broker");
  }
}
void addTable(int theValue) {
  if (view.button_state >1) {
    buildingList.get(view.listOneSelection).Rooms.get(view.listTwoSelection).addDesk();
  }
  view.button_state = view.button_state +1;
}
void removeTable(int theValue) {
  if (view.button_state > 1) {
    buildingList.get(view.listOneSelection).Rooms.get(view.listTwoSelection).removeDesk();
  }
  view.button_state = view.button_state +1;
}

void Publish(int theValue) {
  if (view.publish_state > 1) {
      publishToBroker( buildingList);
    
  }
  view.publish_state++;
}

void request(int theValue){
  if(view.publish_state > 1){
      client.publish("FindADesk_RequestDatabase", "request");
  }
  view.publish_state++;
}
