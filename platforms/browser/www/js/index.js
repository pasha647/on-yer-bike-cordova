var map = L.map('map', { zoomControl:false }).setView([53.3477, -6.2632], 12);
var route = [];
var highSecurtiy = false;

var lockIcon = L.ExtraMarkers.icon({
    icon: 'fa-lock',
    iconColor: 'white',
    markerColor: 'blue',
    shape: 'circle',
    prefix: 'fa'
});

var destinationIcon = L.ExtraMarkers.icon({
    icon: 'fa-flag-checkered',
    iconColor: 'white',
    markerColor: 'red',
    shape: 'circle',
    prefix: 'fa'
});

var startIcon = L.ExtraMarkers.icon({
    icon: 'fa-bicycle',
    iconColor: 'white',
    markerColor: 'green',
    shape: 'circle',
    prefix: 'fa'
});

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18
}).addTo(map);

function DisplayStations(){
    if(markerClusters){
        return;
    }
    markerClusters = L.markerClusterGroup();

    fetch("http://178.62.121.145/world/stations/")
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            new L.GeoJSON(data, {
                onEachFeature: function(feature, layer){
                    var popup = "<dd>" + "Location: " + feature.properties.location + "</dd>" +
                                    "<dd>" + "Security: " + feature.properties.security + "</dd>" +
                                    "<dd>" + "Type: " + feature.properties.type + "</dd>" +
                                    "<dd>" + "Number of Stands: " + feature.properties.no_stands + "</dd>";
                    var m = L.marker(feature.geometry.coordinates, {
                        icon: lockIcon
                    })
                    .bindPopup( popup );
                    if(highSecurtiy){
                        console.log("High Secuirty");
                        if(feature.properties.security === "High" || feature.properties.security === "high"){
                            markerClusters.addLayer( m );
                        }
                    }
                    else{
                        markerClusters.addLayer( m );
                    }

                }
            })
        });
    map.addLayer( markerClusters );
}

function SettingsReset(){
    highSecurtiy = false;
    map.removeLayer(markerClusters);
}

function SetSecurityHigh(){
    highSecurtiy = true;
    map.removeLayer(markerClusters);
    DisplayStations();
}

function SetSecurityLow(){
    highSecurtiy = false;
    map.removeLayer(markerClusters);
    DisplayStations();
}

function Locate(){
    map.locate({setView: true, maxZoom: 13});
    map.on('locationfound', onLocationFound);
}

function onLocationFound(e){
    if(route.length > 0) {
        destMarker = new L.marker(e.latlng, {
            draggable: true,
            icon: destinationIcon
        }).addTo(map);
        route.push(e.latlng);
    }
    else
        {
            startMarker = new L.marker(e.latlng, {
                draggable: true,
                icon: startIcon
            }).addTo(map);
            route.push(e.latlng);
        }
}

function SelectOnMap(){
    if(route.length > 0){
        destMarker = new L.marker(map.getCenter(), {
            draggable: true,
            icon: destinationIcon
        }).addTo(map);
        destMarker.on('dragend', function(event){
        route.push(destMarker.getLatLng());
    });
    }
    else {
        startMarker = new L.marker(map.getCenter(), {
            draggable: true,
            icon: startIcon
        }).addTo(map);
        startMarker.on('dragend', function(event){
        route.push(startMarker.getLatLng());
    });
    }
}

function Create(){
    if(route.length > 1){
        Route();
    }
    map.removeLayer(startMarker);
    map.removeLayer(destMarker);
}

function MapReset(){
    route = [];
    map.removeLayer(closestStation);
    map.removeLayer(markerClusters);
    control.getPlan().setWaypoints([]);

    map.setView([53.3477, -6.2632], 12);
    DisplayStations();
}

function Route() {
    control = L.Routing.control({
        waypoints: [
            route[0],
            route[1]
        ],
        icon: lockIcon,
        show: false,
        routeWhileDragging: false,
        draggable: false,
        showAlternatives: false,
    }).addTo(map);
    map.removeLayer(markerClusters);
    var shortestDistance = 200.0;
    markerClusters.eachLayer(function(layer){
        if(layer._latlng.distanceTo(route[1]) < shortestDistance ) {
            shortestDistance = layer._latlng.distanceTo(route[1]);
            closestStation = layer;
        }
    });
    if(closestStation){
       map.addLayer(closestStation);
    }
}


