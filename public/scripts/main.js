const zipBox = document.getElementById("zipcodeSearch");
const countyBox = document.getElementById("countySearch");
const queriesBox = document.getElementById("searchTags");
const submitBtn = document.getElementById("mapButton");

const mapURL = "mapView.html";

submitBtn.addEventListener("click", () => {
    let zip = zipBox.value;
    let county = countyBox.value;
    let queries = queriesBox.value;

    let URL = mapURL;

    if (zip || county || queries) {
        URL = URL + "?";
    }

    if (zip) {
        URL = URL + "zip=" + zip + "&";
        // TODO: bound input and strip for XSS attacks
        // TODO: support mutliple zipcodes with commas and put into array
    }

    if (county) {
        URL = URL + "cty=" + county + "&";
        // TODO: strip for XSS attacks
        // TODO: support mutliple counties with commas and put into array
    }

    if (queries) {
        URL = URL + "q=" + queries;
        // TODO: strip for XSS attacks
        // TODO: support multiple queries with commas and put into array
    }

    window.location.href = URL;
});