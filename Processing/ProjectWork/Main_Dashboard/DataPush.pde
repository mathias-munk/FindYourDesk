public class JSONObjectCreator {

  JSONObject json;

  JSONObject createJSONString(ArrayList<Room> Rooms) {
    JSONArray values = new JSONArray();

    for (int i = 0; i < Rooms.size(); i++) {
      JSONObject room = new JSONObject();
      room.setInt("id", Rooms.get(i).RoomId);
      room.setString("name", Rooms.get(i).name);
      room.setInt("tables", Rooms.get(i).Desks.size());
      values.setJSONObject(i, room);
    }  
    json = new JSONObject();
    json.setJSONArray("rooms", values);

    return json;
  }
/*
  void publishToBroker(ArrayList<Room> Rooms) {

    String toSend = "{\"rooms\": [ { ";

    for (int i = 0; i < Rooms.size(); i++) {
      toSend += "\"Roomid\": " + Rooms.get(i).RoomId + ", ";
      toSend += "\"name\": " + Rooms.get(i).name + ", ";
      toSend += "\"tables\": " + Rooms.get(i).Desks.size() + " ";

      if (i == Rooms.size()-1) {
        toSend += "} ] }";
      } else {
        toSend += "}, ";
      }
    } 

    println(toSend);
    client.publish("rooms", toSend);
  }
  */
}
