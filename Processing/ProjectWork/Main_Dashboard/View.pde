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

    void build_list(String list_name, ArrayList<String> items){
      
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
      for(String S: items) {
        list.addItem(S,i);
        i = i +1; 
      } 
     
  }
    void build_textEntry(String name){
        Textfield textEntry = cp5.addTextfield(name).setPosition(500, 50).setSize(150,25).setText("Add A button");
        textEntry.clear();
        textEntry.setColorBackground(color(50));
        ControlFont cf1 = new ControlFont(createFont("Arial",20));
        textEntry.setFont(cf1);
    }
  
}

void updateDashboard() {
    surface.setTitle("Stack Delivery Management Dashboard");
      
        Buildings.add("MVB");
        Buildings.add("Wills");
        view.build_list("Buildings", Buildings);
        view.build_list("Rooms", Rooms);
        view.build_textEntry("Add new Room");
       
}
void Buildings(int n) {
  view.listOneSelection=n;
}
void Rooms(int n) {
  view.listTwoSelection=n;
}
void controlEvent(ControlEvent theEvent) {
    // expand order if clicked via API call
    String label = theEvent.getController().getLabel();
    String valueLabel = theEvent.getController().getValueLabel().getText();
    System.out.println(label + valueLabel +  theEvent.getController().getName() );
    
    if(label.equals("Buildings ") || Buildings.contains(label)){
           currentBuilding = buildingList.get(view.listOneSelection);
           println("hellohello");
           Rooms.clear();
           Rooms.addAll(buildingList.get(view.listOneSelection).returnRoomNames()); 
           if (list_spacing > list_x_size + 10) {
              list_spacing = list_spacing - list_x_size -10;
           }
           cp5.remove("Rooms");
           view.build_list("Rooms", Rooms);
           cp5.remove("addTable");
           cp5.addButton("addTable")
            .setValue(0)
            .setPosition(500,150)
            .setSize(100, 19);
            view.button_state = view.button_state +1;
           
        }
     if(label.equals("Rooms ")){
        System.out.println("hello");
        view.currentRoom = 1;
      }
    println(view.listOneSelection);
    if(label.equals("Add new Room")){
      buildingList.get(view.listOneSelection).setRoom(new Room(valueLabel, 1, view.listOneSelection,buildingList.get(view.listOneSelection).Rooms.size()));
      cp5.remove("Rooms");
      Rooms.clear();
      Rooms.addAll(buildingList.get(view.listOneSelection).returnRoomNames());
      list_spacing = list_spacing - list_x_size -10;
      view.build_list("Rooms", Rooms);
      
    }
    
}
void addTable(int theValue){
  if(view.button_state >1) {
    buildingList.get(view.listOneSelection).Rooms.get(view.listTwoSelection).addDesk();
  }
  view.button_state = view.button_state +1;
}

void drawRoom(Room CurrentRoom){
  
}
