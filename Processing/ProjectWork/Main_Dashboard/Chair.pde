public class Chair{
  
  String status;
  int chairNum;
  String chairID;
  int DeskId;
  int RoomId;
  int buildingId;

  public Chair(String newStatus, int newBuildingId, int newRoomID, int newDeskID, int newChairId){
    status = newStatus;
    buildingId = newBuildingId;
    RoomId = newRoomID;
    DeskId = newDeskID;
    chairNum = newChairId;
    
    chairID =  String.valueOf(newChairId) + String.valueOf(newBuildingId) + String.valueOf(newRoomID) + String.valueOf(newDeskID);  
  }
}
