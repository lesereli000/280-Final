const zipBox = document.getElementById("zipcodeSearch");
const countyBox = document.getElementById("countySearch");
const queriesBox = document.getElementById("searchTags");
const submitBtn = document.getElementById("mapButton");

const mapURL = "mapView.html";

let userLat = 0;
let userLng = 0;

if ("geolocation" in navigator) {
    // Prompt user for permission to access their location
    navigator.geolocation.getCurrentPosition(
        // Success callback function
        async (position) => {
            // Get the user's latitude and longitude coordinates
            userLat = position.coords.latitude;
            userLng = position.coords.longitude;

            const zipcounty = await toZipCounty(userLat, userLng);
            zip = zipcounty.zip;
            county = zipcounty.county;
            updateZipField(zip);
            updateCountyField(county);
        },
        // Error callback function
        (error) => {
            // Handle errors, e.g. user denied location sharing permissions
            console.error("Error getting user location:", error);
        }
    );
} else {
    // Geolocation is not supported by the browser
    console.error("Geolocation is not supported by this browser.");
}

submitBtn.addEventListener("click", () => {
    let zip = zipBox.value;
    let county = countyBox.value;
    let queries = queriesBox.value;

    let URL = mapURL;

    if (zip || county || queries) {
        URL = URL + "?";
    }

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
            URL = URL + "zip=" + zipURL.slice(0, -2);
        }
    }

    if (county) {
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
            if (URL === mapURL + "?") {
                URL = URL + "cty=" + ctyURL.slice(0, -2);
            } else {
                URL = URL + "&cty=" + ctyURL.slice(0, -2);
            }
        }
    }

    if (queries) {
        queryArray = queries.split(",");
        let queryURL = "";
        queryArray.forEach(q => {
            q = q.trim();
            q = q.toProperCase();
            if (isNonXSS(q)) {
                queryURL = queryURL + q + ", ";
            }
        });
        if (queryURL != "") {
            if (URL === mapURL + "?") {
                URL = URL + "q=" + queryURL.slice(0, -2);
            } else {
                URL = URL + "&q=" + queryURL.slice(0, -2);
            }
        }
    }

    window.location.href = URL;
});

function isCharNumber(c) {
    return c >= '0' && c <= '9';
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

function updateZipField(zip) {
    document.getElementById("zipcodeSearch").value = zip;
}

function updateCountyField(county) {
    document.getElementById("countySearch").value = county;
}