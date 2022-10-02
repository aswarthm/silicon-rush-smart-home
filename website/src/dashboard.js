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
  get(child(dbRef,"/")).then((snapshot)=>{
    var value= snapshot.val()["lock"];
    var image=document.querySelector(".image-lock");
    image.src="/images/locked.png";

    image.addEventListener("click", function(){
      console.log(value)
      if(value==1){
        set(ref(database, "/lock" ), 0 )
      }
      else{
        set(ref(database, "/lock" ), 1 )
      }
      
    })

    if(value==1){
      image.src="/images/locked.png";
    }
    else{
      image.src="/images/locked-1.png";
    }

    if(snapshot.val()["door"]){
      document.getElementById("doorstatus").innerHTML = "OPEN"
      document.getElementById("doorstatus").style.color = "green"

    }
    else{
      document.getElementById("doorstatus").innerHTML = "CLOSED"
      document.getElementById("doorstatus").style.color = "red"




    }
    




    //console.log(value);
    
  })
}

function buttonImages(){
  get(child(dbRef, '/')).then((snapshot) => {
    data = snapshot.val()
    if(data["Devices"]["Device1"])
      document.getElementById("butOneImg").src = "/images/green.png"
    
    else
      document.getElementById("butOneImg").src = "/images/red.png"

    if(data["Devices"]["Device2"])
      document.getElementById("butTwoImg").src = "/images/green.png"
    
    else
      document.getElementById("butTwoImg").src = "/images/red.png"

    if(data["Devices"]["Device3"])
      document.getElementById("butThreeImg").src = "/images/green.png"
    
    else
      document.getElementById("butThreeImg").src = "/images/red.png"

    if(data["Devices"]["Device4"])
      document.getElementById("butFourImg").src = "/images/green.png"
    
    else
      document.getElementById("butFourImg").src = "/images/red.png"
    
  })
}



var interval=setInterval(function(){
  image_lock();
  buttonImages();
  read_data();
},100);

