var map = L.map('map').setView([53.3498, -6.2603], 13);
var route = [];

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
}).addTo(map);






function DisplayStations(){
    markerClusters = L.markerClusterGroup();

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
}

function Locate(){
    console.log("locating");
    map.locate({setView: true, maxZoom: 13});
    map.on('locationfound', onLocationFound);
}

function onLocationFound(e){
    console.log("located");
    locatedMarker = L.marker(e.latlng).addTo(map);
    route.push(e.latlng);
}

function SelectOnMap(){
    selectedmarker = new L.marker(map.getCenter(), {
        draggable: true
    }).addTo(map);
    alert("Drag and drop the marker to your desired location");
    selectedmarker.on('dragend', function(event){
        route.push(selectedmarker.getLatLng());
    });
}

function Create(){
    if(route.length > 1){
        Route();
    }
    map.removeLayer(selectedmarker);
    map.removeLayer(locatedMarker);
}

function Reset(){
    route = [];
    map.removeLayer(selectedmarker);
    map.removeLayer(locatedMarker);
    map.removeLayer(closestStation);
    control.getPlan().setWaypoints([]);
}

function Route() {
    control = L.Routing.control({
        waypoints: [
            route[0],
            route[1]
        ],
        show: false,
        routeWhileDragging: false,
        draggable: false
    }).addTo(map);
    map.removeLayer(markerClusters);
    var shortestDistance = 200.0;
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


