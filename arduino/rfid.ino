#include <WiFi.h>
#include <FirebaseESP32.h>
#include <SPI.h>
#include <MFRC522.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include "DHT.h"
#define DHTTYPE DHT11
#define DHTPIN 32
#define FIREBASE_HOST "wifitrackernodemcu-default-rtdb.asia-southeast1.firebasedatabase.app/" //Without http:// or https:// schemes
#define FIREBASE_AUTH "AIzaSyB10JdfjSem5cBjN7TTTw2icr0gXmvLTog"
#define WIFI_SSID "LAPTOP-FU05D055 6508"
#define WIFI_PASSWORD "e814!C87"
float humidity;
float temp;int j=1;
//const int touch1=4;
//const int touch2=33;
//const int touch3=34;
//const int touch4=35;
const int touchPins[4]={4,33,34,35};
int touchState[4]={0,0,0,0};
int prevTouchState[4]={0,0,0,0};
FirebaseData firebaseData;
FirebaseData swStates;
FirebaseJson json;
#define SS_PIN 21
#define RST_PIN 22
MFRC522 rfid(SS_PIN, RST_PIN);
MFRC522::MIFARE_Key key;
byte nuidPICC[4];

String a = "";
String allowedIds[] = {" 87 86 05 214",
                       " 99 185 100 011",
                       " 250 167 90 47"
                      };
boolean cardPresent = false;


String cur = "";
String prev = "";


WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");
String hrMin = "", curDay = "", monthYr = "";
DHT dht(DHTPIN, DHTTYPE);
void setup()
{

  Serial.begin(9600);
  
//  pinMode(redPin, OUTPUT);
//  pinMode(greenPin, OUTPUT);
//  pinMode(bluePin, OUTPUT);
//  led(-1);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  Firebase.reconnectWiFi(true);
  pinMode(touchPins[0],INPUT);
  pinMode(touchPins[1],INPUT);
  pinMode(touchPins[2],INPUT);
  pinMode(touchPins[3],INPUT);


  SPI.begin(); // Init SPI bus
  rfid.PCD_Init(); // Init MFRC522

  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }


  timeClient.begin();
  timeClient.setTimeOffset((5 * 60 + 30) * 60);
  dht.begin();
}
void loop() {

  readNewCard();
  if (cardPresent) {
    Serial.println("New card detected, processing...");
    int id = getID(a) + 1; //because 0 based indexing
//    led(id);
    Serial.println("Card ID: " + String(id));
    getTime();
    Firebase.set(firebaseData, "/lock",1);
    Serial.println(a);
//    led(-1);
    cardPresent = false;
  }
  for (int i = 0; i < 4; i++) {
    if(digitalRead(touchPins[i])==1){
      if(i==2){
        Firebase.getInt(swStates,"/Devices/Device"+String(i+1));
        int ans=swStates.intData();
        if(ans==1)
        {
          ans=0;
        }
        else
        {
          ans=1;
        }
        Firebase.setInt(swStates,"/lock"+String(i+1), ans);
      }
      else
      {
        Firebase.getInt(swStates,"/Devices/Device"+String(i+1));
        int ans=swStates.intData();
        if(ans==1)
        {
          ans=0;
        }
        else
        {
          ans=1;
        }
        Firebase.setInt(swStates,"/Devices/Device"+String(i+1), ans);
      }
      
    }
//    touchState[i] = digitalRead(touchPins[i]);
//    Serial.println(touchState[i]);
//    if (touchState[i] != prevTouchState[i]) {
//      Firebase.setInt(swStates,"/Devices/Device"+String(i+1), touchState[i]);
//      if (touchState[i] == 1) { //detect rising edge
//        deviceState[i] = !deviceState[i];
//        Serial.println("touch" + String(i) + " " + String(deviceState[i]));
//        Firebase.setInt(firebaseData, "/Devices/Device" + String(i + 1), deviceState[i]);
//      }
//      
//    }
//    delay(5000);
//    prevTouchState[i] = touchState[i];
 
  }
  temp = dht.readTemperature();
  humidity=dht.readHumidity();
  while(j<=1)
    {
      Firebase.setString(swStates,"/temperature",temp);
      Firebase.setString(swStates,"/hum",humidity);
      Serial.println(temp);
      Serial.println(humidity);
      j++;
    }
}



void readNewCard() {
  // Look for new cards
  if ( ! rfid.PICC_IsNewCardPresent())
    return;

  if ( ! rfid.PICC_ReadCardSerial())
    return;



  for (byte i = 0; i < 4; i++) {
    nuidPICC[i] = rfid.uid.uidByte[i];
  }

  printHex(rfid.uid.uidByte, rfid.uid.size);
  //Serial.println();
  rfid.PICC_HaltA();


  rfid.PCD_StopCrypto1();
}

int getID(String str) {
  int id = -1;
  for (int i = 0; i < 3; i++) {
    if (a == allowedIds[i]) {
      id = i;
      break;
    }
  }
  return id;
}


void printHex(byte *buffer, byte bufferSize) {
  cardPresent = true;
  a = "";
  for (byte i = 0; i < bufferSize; i++) {
    //Serial.print(buffer[i] < 0x10 ? " 0" : " ");
    a += buffer[i] < 0x10 ? " 0" : " ";
    //Serial.print(buffer[i], HEX);
    a += buffer[i];
  }
  //Serial.println(a);

}


void getTime() {

  timeClient.update();

  int currentHour = timeClient.getHours();

  int currentMinute = timeClient.getMinutes();

  time_t epochTime = timeClient.getEpochTime();
  struct tm *ptm = gmtime ((time_t *)&epochTime);

  int monthDay = ptm->tm_mday;

  int currentMonth = ptm->tm_mon + 1;

  int currentYear = ptm->tm_year + 1900;

  monthYr = String(currentMonth) + "-" + String(currentYear);
  curDay = String(monthDay);
  hrMin = String(currentHour) + "-" + String(currentMinute);
//  Serial.println(monthYr + "\n" + curDay + "\n" + hrMin);


  return;
}

//void led(int id) {
//  if (id == -1) {
//    digitalWrite(redPin, HIGH);
//    digitalWrite(greenPin, HIGH);
//    digitalWrite(bluePin, HIGH);
//  }
//  else if (id == 1) {
//    digitalWrite(redPin, LOW);
//    digitalWrite(greenPin, HIGH);
//    digitalWrite(bluePin, HIGH);
//  }
//  else if (id == 2) {
//    digitalWrite(redPin, HIGH);
//    digitalWrite(greenPin, LOW);
//    digitalWrite(bluePin, HIGH);
//  }
//  else if (id == 3) {
//    digitalWrite(redPin, HIGH);
//    digitalWrite(greenPin, HIGH);
//    digitalWrite(bluePin, LOW);
//  }
//
//}
