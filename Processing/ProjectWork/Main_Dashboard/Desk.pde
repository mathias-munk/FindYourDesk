public class Desk{
    int status;
    int DeskId;
    int RoomID;
    int BuildingID;
    ArrayList<Chair> Chairs = new ArrayList<Chair>();
    int RoomId;
    
    public Desk(int BuildingID,int RoomID, int DeskID ){
      this.BuildingID = BuildingID;
      this.RoomID = RoomID;
      this.DeskId = DeskID;
      for(int i = 0; i <=4; i++){
           Chairs.add(new Chair("Broken",BuildingID, RoomID, DeskID,i));
       }
    }
    
    public void markBroken(int chairID){
    for(Chair c: Chairs){
        if(c.chairNum  == chairID){
          c.status = "Broken";
        }
    }
    }
    
    public int countBroken(){
      int numBroken = 0;
      for(Chair c: Chairs){
        if(c.status.equals("Broken")){
            numBroken++;
        }
    }
    return numBroken;
  }
}
