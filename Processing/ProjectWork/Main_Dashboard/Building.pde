public class Building{
    String Name;
    boolean status;
    String BuildingId;
    ArrayList<Room> Rooms = new ArrayList<Room>();
    
    public Building(String newName){
      Name = newName;
    }
    
    public void setRoom(Room newRoom){
      Rooms.add(newRoom);
    }
   
   public ArrayList<String> returnRoomNames(){
     ArrayList<String> roomNames = new ArrayList<String>(); 
     
     for(Room R: Rooms){
         roomNames.add(R.name);
     }
     return roomNames;
   }
   
   public int brokenInBuilding(){
    int numBroken = 0;
     for(Room r: Rooms){
        numBroken += r.countBroken();
      }
      return numBroken;
   }
}
