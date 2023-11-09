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

// function geocode(){

//     coords = {lat: , lng:};
//     return coords
// }

// if(zip || county){
//     let coords = geocode();
//     initMap(coords)
// }

// include county/zip/filter options in this method
async function findLocations(map){
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    
    markers = [];

    fetch('http://localhost:3000/?county=Vigo')
    .then(response => response.json())
    .then(data =>{
        console.log(data)
        // data = JSON.parse(data);
        for(const location of data){
            console.log(`new location: ${location.agency_id}`);
            console.log(`{lat: ${location.latitude}, lng: ${location.longitude}}`);
            if(location.latitude != null && location.longitude != null){
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

let map;

async function initMap(position) {

  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    mapId: '115c56c4cc9092d4',
    zoom: 11,
    center: position,
    disableDefaultUI: true,
  });

  const markers = findLocations(map);
//   const marker = new AdvancedMarkerElement({
//     map: map,
//     position: position,
//     title: "Uluru",
//   });
}

initMap({lat: 39.7684, lng: -86.1581})

// TODO: data API implementation
// TODO: utilize geocoding API
// TODO: implement result filtering
// TODO: add locations to map
// TODO: create modal to pop up on location