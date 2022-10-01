var data;
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-app.js";
import { getDatabase, ref, child, get, set } from "https://www.gstatic.com/firebasejs/9.9.3/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyB10JdfjSem5cBjN7TTTw2icr0gXmvLTog",
  authDomain: "wifitrackernodemcu.firebaseapp.com",
  databaseURL: "https://wifitrackernodemcu-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "wifitrackernodemcu",
  storageBucket: "wifitrackernodemcu.appspot.com",
  messagingSenderId: "728788519044",
  appId: "1:728788519044:web:2f572b55021c5389431ad1"
};


// Initialize Firebase
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



function turnOn(device){
    set(ref(database, "/Devices/" + device ), 1  )

    get(child(dbRef, '/')).then((snapshot) => {
        data = snapshot.val()
        var usageData = data["Devices"]["usage"][device]
    console.log(usageData.length)

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


