// Need for IMU accelerometer (for some reason?)
#define M5STACK_MPU6886 
/*******************************************************************************************
 *
 * Library includes.
 *
 ******************************************************************************************/
// M5 Stack system.
#include <M5Stack.h>

// M5 Stack Wifi connection.
#include <WiFi.h>
#include <esp_wifi.h>
WiFiClient wifi_client;

// PubSubClient external library.
#include <PubSubClient.h>
PubSubClient ps_client( wifi_client );

// Extra, created by SEGP team
#include "Timer.h"

//Include JSON Parser library (ArduinoJson.h)
#include <ArduinoJson.h>

#define BOOKED_RECEIVED (jsonDoc["buildingId"] == buildingId && jsonDoc["roomId"] == roomId && jsonDoc["chairId"] == chairId && jsonDoc["state"] == "booked")

enum state {Free, Use, Booked, Lunch, Setup};
enum screen {setBuilding, setRoom, setChair};

/*******************************************************************************************
 *
 * Global Variables
 *
 ******************************************************************************************/

// If you are going to use UoB Guest network, you need to:
// - first log in with your phone or laptop, accept terms.
// - copy your devices MAC address values into this array
// - on Linux/MAC, open the command line and type ifconfig.
// - on Windows, open command line and type ipconfig
// - On your phone, I have no idea (but it is possible)
// MATT LAPTOP
//uint8_t guestMacAddress[6] = {0xAC, 0x2B, 0x6E, 0x86, 0xB0, 0xCD};
// MATT PHONE
uint8_t guestMacAddress[6] = {0x64, 0xa2, 0xf9, 0xb6, 0xe4, 0xb8};

// Wifi settings - UNIVERSITY
//const char* ssid = "UoB Guest";                 // Set name of Wifi Network
//const char* password = "";                      // No password for UoB Guest

//Wifi settings - MATT HOME
const char* ssid = "VM1945866";                 // Set name of Wifi Network
const char* password = "";          // No password for UoB Guest        


// MQTT Settings
const char* MQTT_clientname = "deskClient(Stick)"; // Make up a short name
const char* MQTT_sub_topic = "chair_booking"; // pub/sub topics
const char* MQTT_pub_topic = "chair_booking"; // You might want to create your own

// Please leave this alone - to connect to HiveMQ
const char* server = "broker.mqttdashboard.com";
const int port = 1883;

// Instance of a Timer class, which allows us
// a basic task scheduling of some code.  See
// it used in Loop().
// See Timer.h for more details.
// Argument = millisecond period to schedule
// task.  Here, 2 seconds.
Timer publishing_timer(1000);


/*******************************************************************************************
 *
 * Setup() and Loop()
 *
 ******************************************************************************************/

float accX = 0.0F;
float accY = 0.0F;
float accZ = 0.0F;
float initX = 0.0F;
float initY = 0.0F;
float initZ = 0.0F;
int state;

// Time in seconds
int lunchTimer = 10;
int bookedTimer = 10;
uint32_t targetTime = 0;   

//Chair identifier
int buildingId;
int roomId;
int chairId;

// Standard, one time setup function.
void setup() {

    // Setup M5 Stack, display some text
    // on the screen.
    // Note, other functions are using the
    // LCD so expect errors if you delete this.
    M5.begin();
    M5.Power.begin();
    M5.IMU.Init();
    M5.Lcd.setRotation(3);
    M5.Lcd.fillScreen(BLACK);
    M5.Lcd.setCursor( 10, 10 );
    M5.Lcd.setTextColor( WHITE );
    M5.Lcd.println("Reset, connecting...");

    // Setup a serial port, good for debugging.
    // You can view data with the Arduino IDE
    // serial monitor.
    Serial.begin(115200);
    delay(10);
    Serial.println("*** RESET ***\n");

    // Use this with no wifi password set.
    // e.g., UoB Guest network.
    //setupWifi();

    // If you are using your own Wifi access
    // point, you might need to use this call
    // for a password protected connection.
    setupWifiWithPassword();

    // Sets up a connection to hiveMQ.
    // Sets up a call back function to run
    // which checks for new messages.
    setupMQTT();


    // Maybe you need to write your own
    // setup code after this...
    M5.IMU.getAccelData(&initX,&initY,&initZ);
    state = Free;
    targetTime = millis() + 1000;
    
}


// Standard, iterative loop function (main)
void loop() {
  M5.Lcd.setTextSize(3);
  M5.update();
  M5.IMU.getAccelData(&accX,&accY,&accZ);
 
  // Leave this code here.  It checks that you are
  // still connected, and performs an update of itself.
  if (!ps_client.connected()) {
    M5.Lcd.fillScreen(BLACK);
    M5.Lcd.setCursor( 10, 10 );
    reconnect();
    publishMessage("free");
    state = Setup;
  }
  
  lunchTimer = 10;
  bookedTimer = 10;

  if (state == Free) {
    free_loop();
  }
  else if (state == Use) {
    use_loop();
  }
  else if (state == Booked) {
    booked_loop();
  }
  else if (state == Lunch) {
    lunch_loop();
  }
  else if (state == Setup){
    setup_loop();
  }
}


// Chair can be booked through receiving input from MQTT
// Chair can go to 'In use' through detecting movement
// Chair can (FOR NOW) change to lunch by pressing the button in free
void free_loop() {
  printFreeScreen();
  while (state == Free) {
    M5.update();
    M5.IMU.getAccelData(&accX,&accY,&accZ);
    ps_client.loop();
    if ((abs(accX-initX) > 0.3) || (abs(accY - initY) > 0.3) || (abs(accZ - initZ) > 0.3)) {
      state = Use;
      publishMessage("use");
    }
    else if(M5.BtnC.wasReleased()){
      state = Lunch;
      publishMessage("lunch");
    }
    else if(M5.BtnA.wasReleased() && M5.BtnC.wasReleased()){
      state = Setup;
    }
  }
}

void printFreeScreen() {
  M5.Lcd.fillScreen( GREEN );
  M5.Lcd.setTextDatum(CC_DATUM);
  M5.Lcd.drawString("Free", (int)(M5.Lcd.width()/2), (int)(M5.Lcd.height()/2), 2);
}

// Chair can return to free after no movement detected (for 10s?)
// Chair can go to 'Lunch' by pressing button
void use_loop() {
  printUseScreen();
  float cumMovement = 100;
  while (state == Use) {
    M5.update();
    M5.IMU.getAccelData(&accX,&accY,&accZ);
 
    cumMovement += abs(accX-initX) + abs(accY-initY) + abs(accZ-initZ);
    if (cumMovement <= 0) {
      state = Free;
      publishMessage("free");
    }
    if(M5.BtnC.wasReleased()){
      state = Lunch;
      publishMessage("lunch");
    }
    if (cumMovement >= 0) {
      cumMovement = cumMovement - 1;
      delay(100);
    }
  }
}

void printUseScreen() {
  M5.Lcd.fillScreen(0xfbe4);
  M5.Lcd.setTextDatum( BC_DATUM );
  M5.Lcd.drawString("In", (int)(M5.Lcd.width()/2), (int)(M5.Lcd.height()/2), 2);
  M5.Lcd.setTextDatum( TC_DATUM );
  M5.Lcd.drawString("Use", (int)(M5.Lcd.width()/2), (int)(M5.Lcd.height()/2), 2);
}

// Chair can return to free after 10min timer runs out (20s timer for test)
// Chair can go to in use if card is scanned (button is pressed in tests)
void booked_loop() {
  publishMessage("In booked loop");
  while (state == Booked) {
    if(M5.BtnA.wasReleased()){
      state = Use;
      publishMessage("use");
    }
    if (bookedTimer <= 0) {
      state = Free;
      publishMessage("free");
    }
    if( publishing_timer.isReady() ) {
      bookedTimer--;
      printBookedScreen();
      publishing_timer.reset();
    }
  }
}

void printBookedScreen() {
  int minutes = bookedTimer / 60;
  int seconds = bookedTimer % 60;
  M5.Lcd.fillScreen( RED );
  M5.Lcd.setTextDatum( BC_DATUM );
  M5.Lcd.drawString("Booked:", (int)(M5.Lcd.width()/2), (int)(M5.Lcd.height()/2), 2);
  M5.Lcd.setTextDatum( TC_DATUM );
  M5.Lcd.drawString((String)minutes + ":" + (String)seconds, (int)(M5.Lcd.width()/2), (int)(M5.Lcd.height()/2), 2);
}

// Chair can return to 'Use' if movement detected before 45min (10s) timer runs out
// Chair goes back to 'Free' if no movement detected after 45min timer
void lunch_loop() {
  float cumMovement = 0;
  while (state == Lunch) {
    M5.update();
    M5.IMU.getAccelData(&accX,&accY,&accZ);
  
    cumMovement += abs(accX-initX) + abs(accY-initY) + abs(accZ-initZ);
  
    if (cumMovement >= 10000) {
      state = Use;
      publishMessage("use");
    }
    if (lunchTimer <= 0) {
      state = Free;
      publishMessage("free");
    }
    if( publishing_timer.isReady() ) {
      lunchTimer--;
      printLunchScreen();
      publishing_timer.reset();
    }
    if (cumMovement >= 0) {
      cumMovement = cumMovement - 20;
      delay(10);
    }
  }
}

void printLunchScreen() {
  int minutes = lunchTimer / 60;
  int seconds = lunchTimer % 60;
  // Yellow
  M5.Lcd.fillScreen(0xff80);
  M5.Lcd.setTextDatum( BC_DATUM );
  M5.Lcd.drawString("Lunch:", (int)(M5.Lcd.width()/2), (int)(M5.Lcd.height()/2), 2);
  M5.Lcd.setTextDatum( TC_DATUM );
  M5.Lcd.drawString((String)minutes + ":" + (String)seconds, (int)(M5.Lcd.width()/2), (int)(M5.Lcd.height()/2), 2);
}

//Loop used to set up chair when first installing stack in a room. Accessed by pressing buttons A and C simultaneously.
void setup_loop(){

  int idsSet = 0;
  buildingId = 0;
  roomId = 0;
  chairId = 0;
  
  int screen = setBuilding;
  
  printSetupScreen(&screen);
  
  while (state == Setup)
  {
   
    if (screen == setBuilding) {
    setup_building_loop(&screen);
    }
    else if (screen == setRoom)
    {
      setup_room_loop(&screen);
    }
    else if (screen == setChair)
    {
      setup_chair_loop(&screen);
    } 
  }
  
  
}

void setup_building_loop(int *screen)
{
  printSetupScreen(screen);

  while (*screen == setBuilding)
  {
    
    if (M5.BtnC.wasReleased())
    {
      if (buildingId > 0) 
      {
        buildingId--;
      }
    }
    if (M5.BtnA.wasReleased())
    {
      Serial.print("Button a pressed");
      buildingId++;
      printSetupScreen(screen);
    }
  }
}

void setup_room_loop(int *screen)
{
  
}

void setup_chair_loop(int *screen)
{
  
}

void printSetupScreen(int *screen){
  M5.Lcd.fillScreen(0x3B98);
  if (*screen == setBuilding)
  { 
    M5.Lcd.setTextDatum( BC_DATUM );
    M5.Lcd.drawString("Set BuildingId:", (int)(M5.Lcd.width()/2), (int)(M5.Lcd.height()/2), 2);
    M5.Lcd.setTextDatum( TC_DATUM );
    M5.Lcd.drawString((String) buildingId, (int)(M5.Lcd.width()/2), (int)(M5.Lcd.height()/2), 2);
  }
  else if (*screen == setRoom)
  {  
    M5.Lcd.setTextDatum( BC_DATUM );
    M5.Lcd.drawString("Set RoomId:", (int)(M5.Lcd.width()/2), (int)(M5.Lcd.height()/2), 2);
    M5.Lcd.setTextDatum( TC_DATUM );
    M5.Lcd.print(roomId);
  }
  else if (*screen == setChair)
  {
     M5.Lcd.setTextDatum( BC_DATUM );
     M5.Lcd.drawString("Set ChairId:", (int)(M5.Lcd.width()/2), (int)(M5.Lcd.height()/2), 2);
     M5.Lcd.setTextDatum( TC_DATUM );
     M5.Lcd.print(chairId);
  }
  
  
}

/*******************************************************************************************
 *
 * Helper functions after this...
 *
 ******************************************************************************************/


// Use this function to publish a message.  It currently
// checks for a connection, and checks for a zero length
// message.  Note, it doens't do anything if these fail.
//
// Note that, it publishes to MQTT_topic value
//
// Also, it doesn't seem to like a concatenated String
// to be passed in directly as an argument like:
// publishMessage( "my text" + millis() );
// So instead, pre-prepare a String variable, and then
// pass that.
void publishMessage( String message ) {

  if( ps_client.connected() ) {

    // Make sure the message isn't blank.
    if( message.length() > 0 ) {

      // Convert to char array
      char msg[ message.length()+1 ];
      message.toCharArray( msg, message.length()+1 );

      // Send
      ps_client.publish( MQTT_pub_topic, msg );
    }

  } else {
    Serial.println("Can't publish message: Not connected to MQTT :( ");

  }


}

// This is where we pick up messages from the MQTT broker.
// This function is called automatically when a message is
// received.
//
// Note that, it receives from MQTT_topic value.
//
// Note that, you will receive messages from yourself, if
// you publish a message, activating this function.

void callback(char* topic, byte* payload, unsigned int length) {

  //Set up JSON buffer
  StaticJsonDocument<200> jsonDoc;
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  String in_str = "";

  // Copy chars to a String for convenience.
  // Also prints to USB serial for debugging
  for (int i=0;i<length;i++) {
    in_str += (char)payload[i];
    Serial.print((char)payload[i]);
  }

  auto error = deserializeJson(jsonDoc, in_str);
  //If parsing fails, print the error to serial.
  if (error) {
    Serial.print(F("deserializeJson() failed with code "));
    Serial.println(error.c_str());
    return;
  }
  
  if (BOOKED_RECEIVED) {
    if (state == Free) {
      state = Booked;
    }
  }

}


/*******************************************************************************************
 *
 *
 * You shouldn't need to change any code below this point!
 *
 *
 *
 ******************************************************************************************/


void setupMQTT() {
    ps_client.setServer(server, port);
    ps_client.setCallback(callback);
}

void setupWifi() {
    byte mac[6];
    Serial.println("Original MAC address: " + String(WiFi.macAddress()));
    esp_base_mac_addr_set(guestMacAddress);
    Serial.println("Borrowed MAC address: " + String(WiFi.macAddress()));

    Serial.println("Connecting to network: " + String(ssid));
    WiFi.begin(ssid );
    while (WiFi.status() != WL_CONNECTED) delay(500);
    Serial.println("IP address allocated: " + String(WiFi.localIP()));
}

void setupWifiWithPassword( ) {
    byte mac[6];
    Serial.println("Original MAC address: " + String(WiFi.macAddress()));
    esp_base_mac_addr_set(guestMacAddress);
    Serial.println("Borrowed MAC address: " + String(WiFi.macAddress()));

    Serial.println("Connecting to network: " + String(ssid));
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) delay(500);
    Serial.println("IP address allocated: " + String(WiFi.localIP()));

}



void reconnect() {

  // Loop until we're reconnected
  while (!ps_client.connected()) {

    Serial.print("Attempting MQTT connection...");

    // Attempt to connect
    // Sometimes a connection with HiveMQ is refused
    // because an old Client ID is not erased.  So to
    // get around this, we just generate new ID's
    // every time we need to reconnect.
    String new_id = generateID();

    Serial.print("connecting with ID ");
    Serial.println( new_id );

    char id_array[ (int)new_id.length() ];
    new_id.toCharArray(id_array, sizeof( id_array ) );

    if (ps_client.connect( id_array ) ) {
      Serial.println("connected");

      // Once connected, publish an announcement...
      ps_client.publish( MQTT_pub_topic, "M5STACK CONNECTED");
      // ... and resubscribe
      ps_client.subscribe( MQTT_sub_topic );
    } else {
      M5.Lcd.println(" - Coudn't connect to HiveMQ :(");
      M5.Lcd.println("   Trying again.");
      Serial.print("failed, rc=");
      Serial.print(ps_client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
  M5.Lcd.println(" - Success!  Connected to HiveMQ\n\n");
}

String generateID() {

  String id_str = MQTT_clientname;
  id_str += random(0,9999);

  return id_str;
}
