public class Room{
    String name;
    boolean status;
    int RoomId;
    ArrayList<Desk> Desks = new ArrayList<Desk>();
    int BuildingId;
    
    public Room(String newName, int numOfTables, int BuildingId, int RoomId){
      this.RoomId = RoomId;
      this.BuildingId = BuildingId;
      for(int i = 0; i<numOfTables; i++){
         Desks.add(new Desk(BuildingId,RoomId,i*4));
       }
       name = newName;
    }
    
    public boolean addDesk(){
      if(Desks.size() >= 15){
        return false;
      }
      
      Desks.add(new Desk(BuildingId,RoomId,Desks.size()+1));
      return true;
    }
    
}
