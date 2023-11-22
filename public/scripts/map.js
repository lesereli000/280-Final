// TODO: Remove auto search
// TODO: Auto fill search params from URL
// TODO: Remove google map markers already there

const slider = document.getElementById("dist");
const output = document.getElementById("distLabel");
output.innerHTML = `Max Distance: ${slider.value} Miles`;


let userLat = 0;
let userLng = 0;

if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            userLat = position.coords.latitude;
            userLng = position.coords.longitude;

            const zipcounty = await toZipCounty(userLat, userLng);
            zip = zipcounty.zip;
            county = zipcounty.county;
            initMap();
            updateZipField(zip);
            updateCountyField(county);
        },
        (error) => {
            console.error("Error getting user location:", error.message);
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

slider.oninput = function () {
    output.innerHTML = `Max Distance: ${this.value} Miles`;
}

const subcats = document.querySelectorAll(".taxon-sub-cat-btn");

let activeFilters = [];

function cleanArray(array) {
    let newArr = [];
    for (const val of array) {
        if (val != undefined) {
            newArr.push(val);
        }
    }
    return newArr;
}

for (const subcat of subcats) {
    subcat.onclick = function () {
        this.classList.toggle("active");
        if (this.classList.contains("active")) {
            activeFilters.push(this.textContent);
        } else {
            activeFilters[activeFilters.indexOf(this.textContent)] = undefined;
            activeFilters = cleanArray(activeFilters);
        }
        console.log(activeFilters);
    };
}

const headers = document.querySelectorAll(".taxon-header");

for (const header of headers) {
    header.onclick = function () {
        // activeFilters = [];
        console.log(activeFilters);
        for (const subcat of document.querySelectorAll(`${this.dataset.bsTarget} button`)) {
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

const search = document.getElementById("searchBar");
let searches = urlParams.get('q');
search.value = searches;

async function findLocations(map) {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    markers = [];
    infos = [];
    let queryString = "";

    queryString += `range=${slider.value}&`;

    if (activeFilters.length != 0) {
        queryString += `filters=${activeFilters}&`
    }

    if (search.value) {
        queryArray = search.value.split(",");
        let queryURL = "";
        queryArray.forEach(q => {
            q = q.trim();
            q = q.toProperCase();
            if (isNonXSS(q)) {
                queryURL = queryURL + q + ", ";
            }
        });
        if (queryURL != "") {
            queryString += `search=${search.value}&`;
        }
    }

    console.log(queryString);

    if (zip) {
        zip = zip.replaceAll(" ", "");
        zipArray = zip.split(",");
        let zipURL = "";
        zipArray.forEach(curZip => {
            if (curZip.length == 5) {
                if (isCharNumber(curZip.charAt(0)) && isCharNumber(curZip.charAt(1)) && isCharNumber(curZip.charAt(2)) && isCharNumber(curZip.charAt(3)) && isCharNumber(curZip.charAt(4))) {
                    zipURL = zipURL + curZip + ", ";
                }
            }
        });
        if (zipURL != "") {
            queryString += `zipcode=${zipURL.slice(0, -2)}&`;
            updateSearchNearField(zipURL.slice(0, -2));
        }
    } else if (county) {
        ctyArray = county.split(",");
        let ctyURL = "";
        ctyArray.forEach(curCty => {
            curCty = curCty.trim();
            curCty = curCty.toProperCase();
            if (isCounty(curCty)) {
                if (curCty == "Dekalb") curCty = "DeKalb";
                if (curCty == "Lagrange") curCty = "LaGrange";
                if (curCty == "Laporte") curCty = "LaPorte";
                ctyURL = ctyURL + curCty + ", ";
            }
        });
        if (ctyURL != "") {
            queryString += `county=${ctyURL.slice(0, -2)}`;
            updateSearchNearField(ctyURL.slice(0, -2) + " County");
        }
        console.log(queryString);
    }
    // TODO: Fix line below
    // window.location.href = `mapView.html?${queryString}`;
    document.getElementById("loader").classList.add("loader");
    document.getElementById("loaderParent").classList.add("loader-parent");
    fetch(`http://localhost:3000/?${queryString}`)
        .then(response => response.json())
        .then(async data => {
            for (const location of data) {
                if (location.latitude != null && location.longitude != null) {
                    const coords = await getCoords(location);
                    location.longitude = coords.lng;
                    location.latitude = coords.lat;

                    const marker = new AdvancedMarkerElement({
                        map: map,
                        position: { lat: location.latitude, lng: location.longitude },
                        title: location.agency_name,
                    });
                    const info = new google.maps.InfoWindow({
                        content: `<a href="moreInfo.html">
                                <strong>${location.agency_name}</strong>
                                <br>
                                <p>${location.taxonomy_name}</p>
                                </a>`,
                        ariaLabel: location.agency_name,
                    });

                    marker.addListener("gmp-click", () => {
                        info.open({
                            anchor: marker,
                            map,
                        });
                    });
                    markers.push(marker);
                    infos.push(info);
                }
            }
            document.getElementById("loader").classList.remove("loader");
            document.getElementById("loaderParent").classList.remove("loader-parent");
            return markers;
        })
        .catch(error => {
            console.error(error);
            document.getElementById("loader").classList.remove("loader");
            document.getElementById("loaderParent").classList.remove("loader-parent");
        });
}

async function geocode(zip, county) {
    // TODO: Map shows all responses for multi-select (averages for cooords?)
    if (zip) {
        zip = zip.split(", ");
        zip = zip[0];
        await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=AIzaSyD190DfFJZ9FUhKxQ7OPutlmTAcFKjIgV0`)
            .then(response => response.json())
            .then(data => {
                if (data.status === "ZERO_RESULTS") {
                    return coords = { lat: 0, lng: 0 }
                }
                console.log(zip);
                coords = { lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng };
            });
        return coords;
    } else if (county) {
        county = county.split(", ");
        county = county[0];
        await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${county}%20County%20IN&key=AIzaSyD190DfFJZ9FUhKxQ7OPutlmTAcFKjIgV0`)
            .then(response => response.json())
            .then(data => {
                if (data.status === "ZERO_RESULTS") {
                    return coords = { lat: 0, lng: 0 }
                }
                coords = { lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng };
            });
        return coords;
    } else {
        if (userLat != 0) {
            coords = { lat: userLat, lng: userLng };
            console.log(coords);
        } else {
            county = "Marion"
            coords = { lat: 39.7684, lng: -86.1581 };
        }
        return coords;
    }
}

let map;

async function initMap() {

    const { Map } = await google.maps.importLibrary("maps");

    position = await geocode(zip, county);
    if (zip) {
        updateSearchNearField(zip);
    } else {
        updateSearchNearField(county);
    }

    var myStyles = [
        {
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "administrative.land_parcel",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "administrative.neighborhood",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        }
    ];

    map = new Map(document.getElementById("map"), {
        mapId: '115c56c4cc9092d4',
        zoom: 11,
        center: position,
        disableDefaultUI: true,
    });


    const markers = findLocations(map);
}

if (zip || county) {
    initMap();
} else {
    county = "Marion"
    initMap();
}

const zipSearch = document.getElementById("findZip");
zipSearch.addEventListener("click", () => {
    zip = zipBox.value;
    county = "";
    countyBox.value = "";
    if (zip) {
        let coords = geocode(zip, county);
        initMap(coords);

    }
});

const cntySearch = document.getElementById("findCounty");
cntySearch.addEventListener("click", () => {
    county = countyBox.value;
    zip = "";
    zipBox.value = "";
    if (county) {
        let coords = geocode(zip, county);
        initMap(coords);
    }
});

async function getCoords(obj) {
    let coords = "";

    var firstChar = obj.address_1.charAt(0);
    if (!(firstChar <= '9' && firstChar >= '0')) {
        coords = { lat: 0, lng: 0 };
        return coords;
    }

    let address = obj.address_1 + " " + obj.city + " " + obj.county + " " + obj.state_province;
    let filteredAddress = address.replaceAll(" ", "%20");

    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${filteredAddress}&key=AIzaSyD190DfFJZ9FUhKxQ7OPutlmTAcFKjIgV0`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "ZERO_RESULTS") {
                return coords = { lat: 0, lng: 0 }
            }
            coords = { lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng };
            return coords;
        });
}

async function toZipCounty(lat, lng) {
    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyD190DfFJZ9FUhKxQ7OPutlmTAcFKjIgV0`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "ZERO_RESULTS") {
                return zipCounty = { zip: 46204, county: "Marion" }
            }
            let countyFixed = data.results[0].address_components[4].long_name;
            countyFixed = countyFixed.replaceAll(" County", "");
            zipCounty = { zip: data.results[0].address_components[7].long_name, county: countyFixed };
            return zipCounty;
        });
}

function updateZipField(newZip) {
    document.getElementById("zip").value = newZip;
}

function updateCountyField(newCounty) {
    document.getElementById("county").value = newCounty;
}

function updateSearchNearField(newLocation) {
    document.getElementById("locationLabel").innerHTML = `Showing services near ${newLocation}`;
}

String.prototype.toProperCase = function () {
    return this.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
};

function isCounty(str) {
    let valid = false;
    let countyList = ["Adams", "Allen", "Bartholomew", "Benton", "Blackford", "Boone", "Brown", "Carroll", "Cass", "Clark", "Clay", "Clinton", "Crawford", "Daviess", "Dearborn", "Decatur", "Dekalb", "Delaware", "Dubois", "Elkhart", "Fayette", "Floyd", "Fountain", "Franklin", "Fulton", "Gibson", "Grant", "Greene", "Hamilton", "Hancock", "Harrison", "Hendricks", "Henry", "Howard", "Huntington", "Jackson", "Jasper", "Jay", "Jefferson", "Jennings", "Johnson", "Knox", "Kosciusko", "Lagrange", "Lake", "Laporte", "Lawrence", "Madison", "Marion", "Marshall", "Martin", "Miami", "Monroe", "Montgomery", "Morgan", "Newton", "Noble", "Ohio", "Orange", "Owen", "Parke", "Perry", "Pike", "Porter", "Posey", "Pulaski", "Putnam", "Randolph", "Ripley", "Rush", "St. Joseph", "St Joseph", "Saint Joseph", "Scott", "Shelby", "Spencer", "Starke", "Steuben", "Sullivan", "Switzerland", "Tippecanoe", "Tipton", "Union", "Vanderburgh", "Vermillion", "Vigo", "Wabash", "Warren", "Warrick", "Washington", "Wayne", "Wells", "White", "Whitley"];
    countyList.forEach(county => {
        if (county == str) {
            valid = true;
            return;
        }
    });
    return valid;
}

function isNonXSS(str) {
    let valid = false;

    valid = valid || str.includes("<");
    valid = valid || str.includes(">");
    valid = valid || str.includes("(");
    valid = valid || str.includes(")");
    valid = valid || str.includes("{");
    valid = valid || str.includes("}");
    valid = valid || str.includes("[");
    valid = valid || str.includes("]");

    return !valid;
}

function isCharNumber(c) {
    return c >= '0' && c <= '9';
}