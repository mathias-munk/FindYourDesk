public class Room {
  String name;
  boolean status;
  int RoomId;
  ArrayList<Desk> Desks = new ArrayList<Desk>();
  int BuildingId;

  public Room(String newName, int numOfTables, int BuildingId, int RoomId) {
    this.RoomId = RoomId;
    this.BuildingId = BuildingId;
    for (int i = 0; i<numOfTables; i++) {
      Desks.add(new Desk(BuildingId, RoomId, i));
    }
    name = newName;
  }

  public boolean addDesk() {
    if (Desks.size() >= 15) {
      return false;
    }

    Desks.add(new Desk(BuildingId, RoomId, Desks.size()+1));
    return true;
  }

  public boolean removeDesk() {
    if (Desks.size() < 2) {
      return false;
    }
    Desks.remove(Desks.size() - 1);
    return true;
  }
  public boolean findDesk(int deskID, int chairID) {
    for (Desk d : Desks) {
      if (d.DeskId == deskID) {
        d.markBroken(chairID);
        return true;
      }
    }
    return false;
  }
  public int countBroken() {
    int numBroken = 0;
    for (Desk d : Desks) {
      numBroken += d.countBroken();
    }
    return numBroken;
  }
}
