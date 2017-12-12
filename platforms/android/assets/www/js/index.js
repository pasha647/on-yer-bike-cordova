var map = L.map('map').setView([53.3498, -6.2603], 13);
var route = [];

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
}).addTo(map);

var markerClusters = L.markerClusterGroup();

fetch("http://178.62.121.145/world/stations/")
    .then((response) => {
        return response.json();
    })
    .then((data) => {
        console.log(data);
        new L.GeoJSON(data, {
            onEachFeature: function(feature, layer){
                var popup = feature.properties.location;
                var m = L.marker(feature.geometry.coordinates)
                .bindPopup( popup );
                markerClusters.addLayer( m );
            }
        })
    });

map.addLayer( markerClusters );

function Locate(){
    map.locate({setView: true, maxZoom: 16});
}

map.on("click", onMapClick);

function Route() {
    var control = L.Routing.control({
        waypoints: [
            route[0],
            route[1]
        ],
        routeWhileDragging: true
    }).addTo(map);

    control.hide();
    map.removeLayer(markerClusters);
    var closestStation;
    var shortestDistance = 100.0;
    markerClusters.eachLayer(function(layer){
        if(layer._latlng.distanceTo(route[1]) < shortestDistance) {
            shortestDistance = layer._latlng.distanceTo(route[1]);
            closestStation = layer;
        }
            console.log(layer);
    });
    if(closestStation){
       map.addLayer(closestStation);
    }
}

function onMapClick(e) {
    console.log("click");
    if(route.length === 0) {
        route.push(e.latlng);
        var newMarker = new L.marker(e.latlng).addTo(map);
        console.log("start: " + route[0]);
    }
    else if(route.length === 1){
        route.push(e.latlng);
        console.log("dest: " + route[1]);
        Route();
    }
}


