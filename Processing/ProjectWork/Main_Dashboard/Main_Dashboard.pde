import mqtt.*;
import java.util.*;
import controlP5.*;


ControlP5 cp5;
MQTTClient client;
Dashboard_view view = new Dashboard_view();
ArrayList<Building> buildingList = new ArrayList<Building>();
Building mvb = new Building("MVB");
Room testRoom = new Room("1.11", 6, 1,1);
Room testRoom2 = new Room("1.33", 4, 1,1);
Building Wills = new Building("Wills");
String MQTT_topic = "FindADesk_ProcessingToWeb";
String MQTT_topic2 = "FindADesk_StackToProcessing";
int brokenChairCounter = 0;
ArrayList<Chair> brokenChairs = new ArrayList<Chair>();


void draw() {
  background(0);
  drawTables();

}

void drawTables(){
  int chairCounter = 0;
  int deskCounter = 0;
  brokenChairCounter = 0;
  if(view.currentRoom == 1 && view.listTwoSelection > -1 && view.listTwoSelection < currentBuilding.Rooms.size()) {
    for(int recty = 300; recty <= 800; recty += 190) 
      for(int rectx =30; rectx <= 800; rectx += 160){
        fill(240);
        rect(rectx, recty, 130, 90);
        fill(0,0,0);
        textSize(10);
        text(deskCounter, rectx + 60, recty + 45); 
          for(int chairx = 0; chairx <=100; chairx += 100){
            for(int chairy = -50; chairy <= 150; chairy += 150){
            if(currentBuilding.Rooms.get(view.listTwoSelection).Desks.get(deskCounter).Chairs.get(chairCounter).status.equals("available")){
                  fill(0,128,0);  
            }
            else{
                  fill(255,0, 0);
            }
            rect(rectx +chairx,recty +chairy, 30, 30);
            fill(0,0,0);
            textSize(10);
            text(chairCounter, rectx + chairx + 10 , recty + chairy + 15); 
            
            chairCounter++;
          }
           
          }
          chairCounter = 0;
         if(deskCounter == currentBuilding.Rooms.get(view.listTwoSelection).Desks.size()-1){
           return;
         }
          deskCounter++; 
         
      }
    }
}



void publishToBroker(ArrayList<Room> Rooms, ArrayList<Building> Buildings) {
     
   String toSend = "{\"rooms\": [ { ";
     
   for(int i = 0; i < Rooms.size(); i++) {
     toSend += "\"buildingId\": " + Rooms.get(i).BuildingId + ", ";
     toSend += "\"buildingName\": " + Buildings.get(i).Name + ", ";
     toSend += "\"roomId\": " + Rooms.get(i).RoomId + ", ";
     toSend += "\"roomName\": " + Rooms.get(i).name + ", ";
     toSend += "\"tables\": " + Rooms.get(i).Desks.size() + " ";
       
     if(i == Rooms.size()-1) {
       toSend += "} ] }";
     } else {
       toSend += "}, {";
     }
   } 
   
   println(toSend);
   client.publish(MQTT_topic, toSend);
  
}

void clientConnected() {
    println("client connected to broker");
    client.subscribe(MQTT_topic2);
}

void connectionLost() {
    println("connection lost");
}

void messageReceived(String topic, byte[] payload) {
    String toParse = new String(payload);
    println("new message: " + topic + " - " + toParse);
    parseIncoming(toParse);
}

void parseIncoming(String toParse) {
   if(toParse.length() == 0) {
     return;
   }
 
  String state = "";
  int buildingId = 0;
  int deskId = 0;
  int roomId = 0;
  int chairId = 0;
  String[] toParse2 = toParse.split(" ");
  for(int i = 0; i < toParse2.length; i++) {
    if(toParse2[i].equals("\"buildingId\":")) {
      i++;
      toParse2[i] = removeComma(toParse2[i]);
      buildingId = Integer.parseInt(toParse2[i]);
    }
    if(toParse2[i].equals("\"roomId\":")) {
      i++;
      toParse2[i] = removeComma(toParse2[i]);
      roomId = Integer.parseInt(toParse2[i]);
    }
    if(toParse2[i].equals("\"chairId\":")) {
      i++;
      toParse2[i] = removeComma(toParse2[i]);
      chairId = Integer.parseInt(toParse2[i]);
    }
    if(toParse2[i].equals("\"state\":")) {
      i++;
      toParse2[i] = removeComma(toParse2[i]);
      toParse2[i] = removeQuotes(toParse2[i]);
      state = toParse2[i];
    }
  }
  if(chairId == 0) {
    deskId = 0;
  } else if(chairId % 4 == 0) {
    deskId = (int)Math.floor(chairId/4) + 1;
  } else {
    deskId = (int)Math.floor(chairId/4);
  }
  buildingList.get(buildingId).Rooms.get(roomId).Desks.get(deskId).Chairs.get(chairId).status = state;
}
 
String removeComma(String s) {
  if(s.charAt(s.length()-1) == ',') {
    s = s.substring(0, s.length()-1);
  }
  return s;
}

String removeQuotes(String s) {
  if(s.charAt(s.length()-1)=='\"' && s.charAt(0) == '\"') {
    s = s.substring(1, s.length()-1);
  }
  return s;
}

void setup() {
    cp5 = new ControlP5(this);
    size(1000, 1000);
    // refresh the dashboard with the information
    
    background(0);
    mvb.setRoom(testRoom);
    mvb.setRoom(testRoom2);
    Wills.setRoom(testRoom2);
    buildingList.add(mvb);
    buildingList.add(Wills);
    updateDashboard();
    client = new MQTTClient(this);
    client.connect("mqtt://try:try@broker.hivemq.com", "processing_desktop" + random(3));
    delay(100);
}
