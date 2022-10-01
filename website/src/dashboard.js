import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
import {
  getDatabase,
  ref,
  child,
  get,
  set,
} from "https://www.gstatic.com/firebasejs/9.9.3/firebase-database.js";
const firebaseConfig = {
  apiKey: "AIzaSyB10JdfjSem5cBjN7TTTw2icr0gXmvLTog",
  authDomain: "wifitrackernodemcu.firebaseapp.com",
  databaseURL: "https://wifitrackernodemcu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wifitrackernodemcu",
  storageBucket: "wifitrackernodemcu.appspot.com",
  messagingSenderId: "728788519044",
  appId: "1:728788519044:web:2f572b55021c5389431ad1"
};
var devices=document.getElementsByClassName("sign-up");
for(let i=0;i<devices.length;i++){
  
  devices[i].addEventListener("click",function(){
    console.log(devices[i].id)
    toggle(devices[i].id)
  })
}
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(getDatabase());


function toggle(device){
  get(child(dbRef, '/Devices/')).then((snapshot) => {
    if (snapshot.val()[device]){
      turnOff(device)
    }
    else{
      turnOn(device)
    }
  })

}

var data;

function read_data(){
  get(child(dbRef,"/")).then((snapshot)=>{
    data=snapshot.val();
    var temp=data["temperature"];
    var hum=data["hum"];
    document.getElementById("temperature").innerHTML="Temperature:   "+temp;
    document.getElementById("humidity").innerHTML="Humidity:   "+hum;
  })
}

function turnOn(device){
    set(ref(database, "/Devices/" + device ), 1  )

    get(child(dbRef, '/')).then((snapshot) => {
        data = snapshot.val()
        var usageData = data["Devices"]["usage"][device]
    console.log(data)

    set(ref(database, "/Devices/usage/" + device + "/"+ usageData.length), {

      st : new Date().valueOf(),
      dur: -1

    }  )   
    })
    

}


function turnOff(device){
  set(ref(database, "/Devices/" + device ), 0 )

  get(child(dbRef, '/')).then((snapshot) => {
      data = snapshot.val()
      var usageData = data["Devices"]["usage"][device]
  console.log(usageData, usageData.length-1)

  console.log( "/Devices/usage/" + device + "/"+ (usageData.length -1))
  set(ref(database, "/Devices/usage/" + device + "/"+ (usageData.length - 1) + "/dur"), new Date().valueOf() - usageData[usageData.length - 1]["st"])


  })
  

}
function image_lock(){
  const db = getDatabase();
  const dbRef = ref(getDatabase());
  get(child(dbRef,"/lock")).then((snapshot)=>{
    var value= snapshot.val();
    var image=document.querySelector(".image-lock");
    console.log(value);
    if(value==1){
      image.src="/images/locked.png";
    }
    else{
      image.src="/images/locked-1.png";
    }
  })
}
var interval=setInterval(function(){
  image_lock();
  read_data();
},5000);

