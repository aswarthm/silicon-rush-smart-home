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




function turnOn(device){
    set(ref(database, "/Devices/" + device ), 1  )

    get(child(dbRef, '/')).then((snapshot) => {
        data = snapshot.val()
        console.log(data["Devices"]["usage"][device])

    })


    

}

