/*TODO 
 * add logic to detect unknown devices in range //done
 * remove unwanted serial prints
 * send data to spresense
 * remove random comments
 * format code
*/

#include "./esppl_functions.h"
#define numTrack 2 //number of macs to track
#define numFlag 30 //number of macs that can be flagged

#define timeSend 1000*1 // wait this much time beore serial printing
#define timeFlag 1000*10 // how long to wait before flagging a device
#define timeRange 1000*5 // how long to wait before assumign device is not in range

char srcmacchar[] = "00";
char destmacchar[] = "00";
String srcmac, destmac;
String knownMac[70] = {}; // {macAddresses found}
String flagMac[numFlag][2] = {}; // {flagged macAddresses, isIntruder?}
int flagIndex = 0;
int flag = -1;
unsigned long flagTime[numFlag] = {}; //array to store times of flagged devices' last found time
String trackMac[numTrack][2] = {"e45d752023af", "0", ////20f478b12898
                                "e45d752a23ac", "0" };
String serialString = ""; //string to be sent to spresense  
String prevString = "";                              
unsigned long trackTime[numTrack] = {}; //array to store times of devices last found
int numMac = 0; // number of mac addresses found/known
unsigned long timeNow = 0;
unsigned long timeNow2 = 0;

boolean macExists(String mac){
  for(int i = 0; i < numMac; i++){
    if(mac == knownMac[i]){
      return true;
    }
  }
  return false;
}

void addMac(String mac){
  numMac += 1;
  knownMac[numMac] = mac;
  if(millis() > (1000 * 10)){ // if a new mac is found after 1 min, maybe intruder, add to flag list
    flagMac[flagIndex][0] = srcmac;
    flagTime[flagIndex] = millis();
    flagIndex++;
  }
}

void cb(esppl_frame_info *info) {
  srcmac = "";
  destmac = "";  
 // Serial.print("\n");
 
  for(int i = 0; i < 6; i++){
    sprintf(srcmacchar, "%02x", info->sourceaddr[i]);
    sprintf(destmacchar, "%02x", info->receiveraddr[i]);
    srcmac += srcmacchar;
    destmac += destmacchar;
  }
  //Serial.print(srcmac);
  for(int i = 0; i<numTrack; i++){ //loop to check if device is in range
    if(srcmac == trackMac[i][0]){
      trackTime[i] = millis();
      trackMac[i][1] = "1";
//      Serial.print("Device ID ");
//      Serial.print(i);
//      Serial.print(" in range");
//      Serial.println();
    }
    if((unsigned long)(millis() - trackTime[i]) >= timeRange){ //device is invisible if not found for more than 5 seconds
      trackMac[i][1] = "0";
//      Serial.print("Device ID ");
//      Serial.print(i);
//      Serial.print(" not in range");
//      Serial.println();
    }
  }
  for(int i = 0; i<flagIndex; i++){ //loop to check if flagged devices are still in range
    if(srcmac == flagMac[i][0]){
      if((unsigned long)(millis() - flagTime[i]) >= timeFlag){//flag device if in range for more than 1 minute
        flagMac[i][1] = "1";
        flag += 1;
        break;
      }
      else{
        flagMac[i][1] = "0";
        flag = 0;
      }
  }
  }
  if(!macExists(srcmac)){ //check if mac already exists in database
//    Serial.print("known mac ");
//    Serial.print(" SRC: ");
//    Serial.println(srcmac);
//    Serial.print(" DEST: ");
//    Serial.println(destmac);
  }
  else{  //else add it to database
    addMac(srcmac);
    Serial.print("unknown mac added to list ");
//    Serial.print(" SRC: ");
    Serial.println(srcmac);
//    Serial.print(" DEST: ");
//    Serial.println(destmac);
}
  if((unsigned long)(millis() - timeNow) >= timeSend){ //Serial to Spresense every 10 seconds
    //TODO send data to spresense // send only device ids that are not in range (format 0,1,1*)(try sending macs if you feel like implementing it) and if any unknown mac found(yes or no)
    for(int i = 0; i < numTrack; i++){
      serialString += trackMac[i][1];
      serialString += ",";
    }  

    serialString += trackMac[1][1];
    /////////////////////////
//    if(flag > 0){
//      serialString += "1";
//    }
//    else{
//      serialString += "0";
//    }
    
   // serialString += "*";
    if((serialString != prevString) || 1){ ////////////debug
      Serial.println(serialString);
    }
    prevString = serialString;
    serialString = "";
    timeNow = millis();
  }
  
//  if(srcmac == "20f478b12898" || destmac == "20f478b12898"){
//    Serial.print("\n");
//    Serial.print(" SRC: ");
//    Serial.print(srcmac);
//    // Serial.printf("%02x", info->sourceaddr[i]);
//    Serial.print(" DEST: ");
//    Serial.print(destmac);
//    //  for (int i = 0; i < 6; i++) Serial.printf("%02x", info->receiveraddr[i]);
//    //  Serial.print(" RSSI: ");
//    //  Serial.print(info->rssi);
//    //  Serial.print(" SEQ: ");
//    //  Serial.print(info->seq_num);
//    //  Serial.print(" CHNL: ");
//    //  Serial.print(info->channel);
//    if (info->ssid_length > 0) {
//      Serial.print(" SSID: ");
//      for (int i = 0; i < info->ssid_length; i++) Serial.print((char) info->ssid[i]);    
//    }
//    
//  }

if(flagIndex > 30){ //reset variables if greater than array capacity
  flagIndex = 0;
}
if(numMac > 100){
  numMac = 0;
}
}

void hw_wdt_disable(){ //disables hardware watchdog
  *((volatile uint32_t*) 0x60000900) &= ~(1); // Hardware WDT OFF
}

void hw_wdt_enable(){
  *((volatile uint32_t*) 0x60000900) |= 1; // Hardware WDT ON
}

void setup() {
  delay(500);
  ESP.wdtDisable(); //disable sw watchdog
  hw_wdt_disable(); //disable hw watchdog
  Serial.begin(9600);
  esppl_init(cb);
  esppl_sniffing_start();
}
void loop() {
  delay(1);
    for (int i = 1; i < 15; i++ ) {
      esppl_set_channel(i);
      while(esppl_process_frames()){
      }
    }
}
