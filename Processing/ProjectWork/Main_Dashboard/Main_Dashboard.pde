import mqtt.*;
import java.util.*;
import controlP5.*;
ControlP5 cp5;
Dashboard_view view = new Dashboard_view();
ArrayList<Building> buildingList = new ArrayList<Building>();
Building mvb = new Building("MVB");
Room testRoom = new Room("1.11", 6, 1,1);
Room testRoom2 = new Room("1.33", 4, 1,1);
Building Wills = new Building("Wills");


void draw() {
  background(0);
  drawTables();

}
void drawTables(){
  int chairCounter = 0;
  int deskCounter = 0;
  if(view.currentRoom == 1 && view.listTwoSelection > -1 && view.listTwoSelection < currentBuilding.Rooms.size()) {
    for(int recty = 300; recty <= 800; recty += 190) 
      for(int rectx =30; rectx <= 800; rectx += 160){
        fill(240);
        rect(rectx, recty, 130, 90);
          for(int chairx = 0; chairx <=100; chairx += 100){
            for(int chairy = -50; chairy <= 150; chairy += 150){
              if(currentBuilding.Rooms.get(view.listTwoSelection).Desks.get(deskCounter).Chairs.get(chairCounter).status == 1){
                    fill(0,128,0);
              }
              else{
                fill(255,0,0);
              }
              rect(rectx +chairx,recty +chairy, 30, 30);
              chairCounter++;
          }
           chairCounter = 0;
          }
         if(deskCounter == currentBuilding.Rooms.get(view.listTwoSelection).Desks.size()-1){
           return;
         }
          deskCounter++; 
         
      }
    }
}


void setup() {
    cp5 = new ControlP5(this);
    size(1000, 1000);
    // connect to the broker
    delay(100);
    // refresh the dashboard with the information
    updateDashboard();
    background(0);
    mvb.setRoom(testRoom);
    mvb.setRoom(testRoom2);
    Wills.setRoom(testRoom2);
    buildingList.add(mvb);
    buildingList.add(Wills);
}
