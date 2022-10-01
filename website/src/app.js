var data;
var magicDayChanger = 0


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

var days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

function drawWeekly(){
    get(child(dbRef, '/')).then((snapshot) => {
        data = snapshot.val()
        //console.log(data)
        
    var rows = []

    var curDate = new Date();
    for (let i = 6; i >= 0; i--) {
        var tempDate = new Date(curDate.valueOf() - i * 24 * 60 * 60 * 1000);
        //console.log(tempDate.getDate(), tempDate.getMonth() + 1);
        rows[rows.length] = [days[tempDate.getDay()], "",  new Date(0,0,0,0,0,0), new Date(0,0,0,0,0,1)]
        
    }

    var usageData = data["Devices"]["usage"]
    //console.log(usageData)

    var htmlString = ""
    var srNo = 0;
    var costPerWeek = 0;
    for (var dev in usageData){
      srNo += 1;
        //console.log(dev,usageData[dev])
        var usageTime = 0
        for (let i=0; i<usageData[dev].length; i++ ){
            //console.log(usageData[dev][i])
           

            var tempDate = new Date(usageData[dev][i]["st"])
            
            if (usageData[dev][i]["dur"]<0){
                var tempEndDate = new Date();
            }
            else{
                var tempEndDate = new Date(usageData[dev][i]["st"] + usageData[dev][i]["dur"])
            }


            if(new Date().valueOf() - tempDate.valueOf() < 7*24*3600*1000 ){
                //console.log(tempDate, tempEndDate)
                
                  var stTime = new Date(0,0,0,tempDate.getHours(), tempDate.getMinutes(),tempDate.getSeconds())
                  var endTime = new Date(0,0,0,tempEndDate.getHours(),tempEndDate.getMinutes(), tempEndDate.getSeconds())

                  usageTime += tempEndDate.valueOf() - tempDate.valueOf()
                  
                  rows[rows.length] = [days[tempDate.getDay()], dev, stTime, endTime] 
                  


            }
        }
        console.log(dev, usageTime)
        var wattage = data["Devices"]["powers"][dev]
        var powerConsumed = usageTime/(1000*3600)*(wattage/1000)
        var perDayCost = powerConsumed*data["powerCost"]
        costPerWeek += perDayCost

        htmlString += '<tr class="tablerow"><th scope="row" align="left">' + srNo + '</th><td class="align">'  + dev + '</td><td class="align">' + powerConsumed.toFixed(2) + '</td><td class="align">' + perDayCost.toFixed(1) + '</td></tr>'


        //rows[0] = ["Monday", "llight", new Date(0,0,0,12,0,0), new Date(0,0,0,13,0,0)]
        //console.log(rows)
        
    }  
    drawChart(rows, "timeline")
    document.getElementById("powerTable").innerHTML = htmlString
    document.getElementById("weeklyCost").innerHTML = costPerWeek.toFixed(1)
});
    
}

function drawDaily(){
  get(child(dbRef, '/')).then((snapshot) => {
    data = snapshot.val()
    var rows = []

    var curDate = new Date();
    var usageData = data["Devices"]["usage"]

    for (var dev in usageData){
      for(let i =0; i< usageData[dev].length; i++){
        var tempDate = new Date(usageData[dev][i]["st"])

        if (usageData[dev][i]["dur"]<0){
          var tempEndDate = new Date();
      }
      else{
          var tempEndDate = new Date(usageData[dev][i]["st"] + usageData[dev][i]["dur"])
      }

      if(new Date().getDay() + magicDayChanger  == tempDate.getDay() ){
        //console.log(tempDate, tempEndDate)
        
          var stTime = new Date(0,0,0,tempDate.getHours(), tempDate.getMinutes(),tempDate.getSeconds())
          var endTime = new Date(0,0,0,tempEndDate.getHours(),tempEndDate.getMinutes(), tempEndDate.getSeconds())
          
          rows[rows.length] = [dev, "", stTime, endTime]  
        
        
        }
      }   
    }
    drawChart(rows, "dailychart")
  })




}



// day, devicename, starttime, endtime
// devicename, devicename, starttime, endtime



//htmlString += '<tr class="tablerow"><th scope="row" align="left">' + i + '</th><td class="align">'  + t + '<td class="align">' + listTeachers[t]/60 + '</td></tr>'






  function drawChart(rows, chartId) {
    var container = document.getElementById(chartId);
    var chart = new google.visualization.Timeline(container);
    var dataTable = new google.visualization.DataTable();
  
    dataTable.addColumn({ type: "string", id: "day" });
    dataTable.addColumn({ type: "string", id: "foodName" });
    dataTable.addColumn({ type: "date", id: "Start" });
    dataTable.addColumn({ type: "date", id: "End" });
  
    for (let i = 0; i < rows.length; i++) {
      dataTable.addRow(rows[i]);
    }
    //console.log(rows)
    //dataTable.addRows(rows);
  
    google.visualization.events.addListener(chart, "ready", changeBorderRadius);
    google.visualization.events.addListener(chart, "select", changeBorderRadius);
    google.visualization.events.addListener(chart, "onmouseover", changeBorderRadius);
    google.visualization.events.addListener( chart, "onmouseout", changeBorderRadius);
  
    function changeBorderRadius() {
      var borderRadius = 4;
      var chartColumns = container.getElementsByTagName("rect");
      Array.prototype.forEach.call(chartColumns, function (column) {
        if (
          column.getAttribute("fill") != "none" &&
          column.getAttribute("stroke") != "1"
        ) {
          column.setAttribute("rx", borderRadius);
          column.setAttribute("ry", borderRadius);
        }
      });
    }
  
    var options = {
      backgroundColor: "#f7f7f7",
      alternatingRowStyle: false,
    };
  
    chart.draw(dataTable, options);
    //chart.draw(dataTable);
  }
  
  const main = async () => {
    drawDaily();
    drawWeekly();

  };
  google.charts.load("current", { packages: ["timeline"], callback: main }); //calls main after loading chart library



console.log(new Date().valueOf())

var a = new Date(1664607862626)



/*FUTURE ME PROBLEMS
Overnight appliances. Maybe write it twice while writing to database

*/