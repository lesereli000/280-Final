const slider = document.getElementById("dist");
const output = document.getElementById("distLabel");
output.innerHTML = `Max Distance: ${slider.value} Miles`;

slider.oninput = function(){
    output.innerHTML = `Max Distance: ${this.value} Miles`;
}

const subcats = document.querySelectorAll(".taxon-sub-cat-btn");

let activeFilters = [];

function cleanArray(array){
    let newArr = [];
    for( const val of array){
        if (val != undefined){
            newArr.push(val);
        }
    }
    return newArr;
}

for (const subcat of subcats){
    subcat.onclick = function() {
        this.classList.toggle("active");
        if (this.classList.contains("active")){
            activeFilters.push(this.textContent);
        } else {
            activeFilters[activeFilters.indexOf(this.textContent)] = undefined;
            activeFilters = cleanArray(activeFilters);
        }
        console.log(activeFilters);
    };
}

const headers = document.querySelectorAll(".taxon-header");

for (const header of headers){
    header.onclick = function(){
        activeFilters = [this.innerHTML];
        console.log(activeFilters);
        for(const subcat of document.querySelectorAll(`${this.dataset.bsTarget} button`)){
            subcat.classList.remove("active");
        }
    };
}

const qString = window.location.search;
const urlParams = new URLSearchParams(qString);

const zipBox = document.getElementById("zip");
const countyBox = document.getElementById("county");

let zip = urlParams.get('zip');
zipBox.value = zip;

let county = urlParams.get('cty');
countyBox.value = county;

async function findLocations(map){
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    markers = [];
    let queryString = "";

    queryString += `range=${slider.value}&`;
    
    // TODO: finish query string building

    if(zip){
        queryString += `zipcode=${zip}`;
    } else if (county) {
        queryString += `county=${county}`;
    }

    fetch(`http://localhost:3000/?${queryString}`)
    .then(response => response.json())
        .then(async data => {
        console.log(data);
        for(const location of data){
            // TODO: create popups
            // TODO: stop after 2500 pins
            if (location.latitude != null && location.longitude != null) {
                const coords = await getCoords(location);
                location.longitude = coords.lng;
                location.latitude = coords.lat;

                markers.push(new AdvancedMarkerElement({
                    map: map,
                    position: {lat: location.latitude, lng: location.longitude},
                    title: location.agency_name,
                }));
            }
        }
        return markers;
    })
    .catch(error =>{
        console.error(error);
    });
}

async function geocode(zip, county){
    let coords = {lat: 39.7684, lng: -86.1581};
    if(zip){
        await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=AIzaSyBPtQdhjLymTBQq5kKId0mO1Wjq6vFh6PY`)
        .then(response => response.json())
        .then(data => {
            coords = {lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng};
        });
        return coords;
    } else if (county) {
        await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${county}&key=AIzaSyBPtQdhjLymTBQq5kKId0mO1Wjq6vFh6PY`)
        .then(response => response.json())
        .then(data => {
            coords = {lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng};
        });
        console.log(coords);
        return coords;
    } else {
        county = "Marion"
        coords = {lat: 39.7684, lng: -86.1581};
        return coords;
    }
    return coords;
}

let map;

async function initMap() {

  const { Map } = await google.maps.importLibrary("maps");

  position = await geocode(zip,county);

  map = new Map(document.getElementById("map"), {
    mapId: '115c56c4cc9092d4',
    zoom: 11,
    center: position,
    disableDefaultUI: true,
  });

  const markers = findLocations(map);
}

// default to Marion County (Indianapolis)
if(zip || county){
    initMap();
} else {
    county = "Marion"
    initMap();
}

// add button listeners to re-init map
const zipSearch = document.getElementById("findZip");
zipSearch.addEventListener("click", () => {
    // console.log("zip click");
    zip = zipBox.value;
    county = "";
    countyBox.value = "";
    // only update map if we know what county to look at
    if(zip) {
        // geocode and re init map
        let coords = geocode(zip,county);
        initMap(coords);
    }
});

const cntySearch = document.getElementById("findCounty");
cntySearch.addEventListener("click", () => {
    // console.log("county click");
    county = countyBox.value;
    zip = "";
    zipBox.value = "";
    // only update map if we know what county to look at
    if(county) {
        // geocode and re init map
        let coords = geocode(zip,county);
        initMap(coords);
    }
});

async function getCoords(obj) {
    let coords = "";

    let address = obj.address_1 + " " + obj.city + " " + obj.county + " " + obj.state_province;
    let filteredAddress = address.replaceAll(" ", "%20");
    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${filteredAddress}&key=AIzaSyBPtQdhjLymTBQq5kKId0mO1Wjq6vFh6PY`)
        .then(response => response.json())
        .then(data => {
            coords = { lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng };
            return coords;
        });
}