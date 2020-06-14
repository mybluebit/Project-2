
// Get all buttons with class="btn" 
var btns = document.getElementsByClassName("btn");

// Loop through the buttons and add the active class to the current/clicked button
for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function() {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
    });
}

  //  Map Function
function updateMap(selectedDate){

  document.getElementById('mapUpdater').innerHTML = "<div id='map' style=' height: 680px;'></div>";


    var myMap = L.map("map", {
        center: [40.7128, -74.0060],
        zoom: 11
      });  

      // Adding tile layer to the map
      p=L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
      }).addTo(myMap);
      
      // Store API query variables
      var url = `http://127.0.0.1:5000/api/v1.0/crime2_data/${selectedDate}`;
      
      // console.log(url);

      // Grab the data with d3
      d3.json(url).then((response) => {
      
        // console.log(response);

        // Create a new marker cluster group
        var markers = L.markerClusterGroup();
      
        // Loop through data
        for (var i = 0; i < response.length; i++) {
      
            // Add a new marker to the cluster group and bind a pop-up
            markers.addLayer(L.marker([response[i].Latitude, response[i].Longitude])
            .bindPopup("<h5><b>Complaint Type: </b>"+response[i].complaintType+"</h5><h6><b>Descriptor: </b>"+response[i].Descriptor+"</h6><h6><b>City: </b>"+response[i].City+"</h6><h6><b>Address: </b>"+response[i].incidentAddress));
      
        }
      
        // Add our marker cluster layer to the map
        myMap.addLayer(markers);
      
      });

      //Adding Covid Info to the map
     
      var url = `http://127.0.0.1:5000/api/v1.0/covid_borough/${selectedDate}`;
      
      // console.log(url);

      // Grab the data with d3
      d3.json(url).then((response) => {
      
        // console.log(response);
      
        // Loop through data
        for (var i = 0; i < response.length; i++) {
      
            // Add a new marker to the cluster group and bind a pop-up
            L.marker([response[i].Latitude, response[i].Longitude])
            .bindPopup("<h5><b>Borough: "+response[i].Borough+"</b></h5><h6><b>Positive Cases: </b>"+response[i].Cases+"</h6><h6><b>Hospitalizations: </b>"+response[i].Hospitalizations+"</h6><h6><b>Deaths: </b>"+response[i].Deaths+"</h6>").addTo(myMap);
      
        }   
      });

      //Showing Borough in Colour
        var link ="https://data.beta.nyc/dataset/0ff93d2d-90ba-457c-9f7e-39e47bf2ac5f/resource/35dd04fb-81b3-479b-a074-a27a37888ce7/download/d085e2f8d0b54d4590b1e7d1f35594c1pediacitiesnycneighborhoods.geojson"

      // Function that will determine the color of a neighborhood based on the borough it belongs to
      function chooseColor(borough) {
        switch (borough) {
        case "Brooklyn":
          return "yellow";
        case "Bronx":
          return "red";
        case "Manhattan":
          return "orange";
        case "Queens":
          return "green";
        case "Staten Island":
          return "purple";
        default:
          return "black";
        }
      }
      
      // Grabbing our GeoJSON data.
      d3.json(link).then(function(data) {
          console.log(data);
        // Creating a geoJSON layer with the retrieved data
        L.geoJson(data, {
          style: function(feature) {
            return {
              color: "white",
              fillColor: chooseColor(feature.properties.borough),
              fillOpacity: 0.25,
              weight: 1.5
            };
          }
        }).addTo(myMap);
      });      
}
   
   
// Setting initial values
let selectedDate = '02/29/2020';
let selectedBorough = 'MANHATTAN';

// Initial function
function init() {
  //find the element in html file which is for date selection 
  var userSelection = d3.select("#selDataset");

  var dateList =[];
  var caseList=[];
  var hospitalizationList=[];
  var deathList = []; 
  var crimeList = [];

  d3.json("/api/v1.0/summary").then((data) => {

    //add the dates from summary table into drop-down box 
    data.forEach(function(d) {
        userSelection.append("option")
        .text(d.Date)
        .property("value", d.Date);

        dateList.push(d.Date);
        caseList.push(d.Cases);
        hospitalizationList.push(d.Hospitalizations);
        deathList.push(d.Deaths);
        crimeList.push(d.ComplaintType);

    });

     // var labels = ['Positive Cases', 'Hospitalizations', 'Deaths', 'Crimes'];

    traceLine1 = {
        x: dateList, 
        y: caseList,
        name: "Positive Cases",
        type: "line",
        line: {color: "#0000ff"}
    }

    traceLine2 = {
        x: dateList, 
        y: hospitalizationList,
        name: "Hospitalizations",
        type: "line",
        line: {color: "#34c73b"}
    }

    traceLine3 = {
        x: dateList, 
        y: deathList,
        name: "Deaths",
        type: "line",
        line: {color: "#ff0000"}
    }

    traceLine4 = {
        x: dateList, 
        y: crimeList,
        name: "Crimes",
        type: "line",
        line: {color: "#ff8207"}
    }

    // Data for the line chart
    var lineData = [traceLine1, traceLine2, traceLine3, traceLine4];

    // Layout for line chart
    var layout_line = {
        title: {
          text: "New York City COVID-19 and crime",
          font: {     
                family: 'Times New Roman, Times, serif',
                color: '#45358d',
                size: 24
        }},
        height: 500,
        width: 1100,        
    };

    Plotly.newPlot("line", lineData, layout_line);

    // Plot positive cases and crimes bar chart
    traceBar1 = {
        x: dateList, 
        y: caseList,
        name: "Positive Cases",
        type: "bar",
        marker: {color: "#0000ff"}
    }

    traceBar2 = {
        x: dateList, 
        y: crimeList,
        name: "Crimes",
        type: "bar",
        marker: {color: "#ff8207"}
    }

    var barData = [traceBar1, traceBar2];
    // Layout for Bar Stacked chart
    var layout_bar = {
         title: {
          text: "New York City Positive Cases and Crime",
          font: {     
                family: 'Times New Roman, Times, serif',
                color: '#45358d',
                size: 24
        }},

        height: 500,
        width: 1100
    };

    Plotly.newPlot("bar_stacked", barData, layout_bar);

    // // Set the currently selected date for which graphs are shown
    // selectedDate = data[0].Date;
    //console.log(data);

  });

    // Calling the update functions
    updateCharts(selectedDate, selectedBorough);
    updateMap(selectedDate);
};

// Chart function
function updateCharts(selectedDate, selectedBorough){

    d3.json(`/api/v1.0/crime_data/${selectedDate}/${selectedBorough}`).then((crimeData) => {
        //console.log(crimeData);

        complaintCount = {};

        for (var i = 0; i< crimeData.length; i++) {
            var currentCrime = crimeData[i].complaintType;
            
            if(currentCrime in complaintCount){
 
                complaintCount[currentCrime] += 1;
            }else {
                complaintCount[currentCrime] = 1;
            }
        }
        
        traceBar = {
            x: Object.keys(complaintCount), 
            y: Object.values(complaintCount),
            name: "Complaint Types",
            type: "bar",
            marker: {color: "#ff8207"}

        }
    
        var barData = [traceBar];
        // Layout for bar chart
        var layout_bar = {
             title: {
              text: `Crimes in ${selectedBorough} at ${selectedDate}`,
              font: {     
                    family: 'Times New Roman, Times, serif',
                    color: '#45358d',
                    size: 24
            }},
            height: 400,
            width: 620
            
        };
    
        Plotly.newPlot("bar", barData, layout_bar);

        // Summary crime table
        var keys = Object.keys(complaintCount);
        var values = Object.values(complaintCount);
    
        var crimeTable = d3.select("#crimeTable");
        crimeTable.html("");
        for (var i=0; i< keys.length; i++) {
            var row = crimeTable.append("tr");
            var row = crimeTable.append("tr"); 
            var cell = row.append("td");
            cell.text(`${keys[i]}: ${values[i]}`);
        }; 

    });
    selectedBorough = selectedBorough.toUpperCase();
    // console.log(selectedDate);
    // console.log(selectedBorough);

    // Polar chart

    d3.json(`/api/v1.0/covid_data/${selectedDate}/${selectedBorough}`).then((covidData) => {

        //console.log(covidData)
        var covid = covidData[0];

        var polarValues = [covid.Cases, covid.Hospitalizations, covid.Deaths];

        var labels = ['Positive Cases', 'Hospitalizations', 'Deaths'];

      // Polar Chart
      d3.select('#chartjsDiv').html('<canvas id="polarChart" width="400" height="400"></canvas>');
      var ctx = document.getElementById('polarChart');

      
      var options = {
          title: {
              display: true,
              text: `${selectedBorough} COVID-19 at ${selectedDate}`,
              fontFamily: 'Times New Roman, Times, serif',
              fontColor : '#45358d',
              fontSize: 24,
              fontStyle: 'normal',

              position: "top",
              events: ['click']
          },
          maintainAspectRatio: false,
      };
      var data = {
          datasets: [{
              data: polarValues,
              backgroundColor: ["#0000ff","#34c73b","#ff0000"]
          }],
      
          // These labels appear in the legend and in the tooltips when hovering different arcs
          labels: labels
          };
          //console.log(ctx.attributes)
  

          var mychart = new Chart(ctx, {
              data: data,
              type: 'polarArea',
              options: options
          });

      // Summary Covid-19 table

      var covidTable = d3.select("#covidTable");
      covidTable.html("");
  
      console.log(covidData);
      covidData.forEach(info=> {
  
          var row = covidTable.append("tr");
          Object.entries(info).forEach(([key,value]) => {
              var row = covidTable.append("tr"); 
              var cell = row.append("td");
              if (key === 'Cases' || key === 'Hospitalizations' || key === "Deaths"){
                  cell.text(`${key}: ${value}`);
              }
          });
      }); 

    });

    d3.json(`/api/v1.0/covid_crime/${selectedBorough}`).then((covidCrimes) => {

        console.log(covidCrimes);

        var dateList =[];
        var caseList=[];
        var hospitalizationList=[];
        var deathList = []; 
        var crimeList = [];

        covidCrimes.forEach(function(d) {
            dateList.push(d.Date);
            caseList.push(d.Cases);
            hospitalizationList.push(d.Hospitalizations);
            deathList.push(d.Deaths);
            crimeList.push(d.TotalCrimes);
        });
    
        var labels = ['Positive Cases', 'Hospitalizations', 'Deaths', 'Crimes'];
    
        traceLine1 = {
            x: dateList, 
            y: caseList,
            name: "Positive Cases",
            type: "line",
            line: {color: "#0000ff"}
          }
    
        traceLine2 = {
            x: dateList, 
            y: hospitalizationList,
            name: "Hospitalizations",
            type: "line",
            line: {color: "#34c73b"}

        }
    
        traceLine3 = {
            x: dateList, 
            y: deathList,
            name: "Deaths",
            type: "line",
            line: {color: "#ff0000"}

        }
    
        traceLine4 = {
            x: dateList, 
            y: crimeList,
            name: "Crimes",
            type: "line",
            line: {color: "#ff8207"}

        }
    
        // Data for the line chart
        var lineData = [traceLine1, traceLine2, traceLine3, traceLine4];
    
        // Layout for line chart
        var layout_line = {
             title: {
              text: `${selectedBorough} -Total COVID-19 and Crime Incidents`,
              font: {     
                    family: 'Times New Roman, Times, serif',
                    color: '#45358d',
                    size: 24
            }},
            height: 500,
            width: 1100
        };
    
        Plotly.newPlot("lineChartTotal", lineData, layout_line);

    });  
};


// When user selects an entry from drop-down, this function is called from the html
function optionChanged(optDate) {
    updateCharts(optDate, selectedBorough);
    selectedDate = optDate;
    updateMap(selectedDate);
}


// Initialize webpage
init();
