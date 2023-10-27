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

    if(zip || county || queries){
        URL = URL + "?";
    }

    if(zip){
        URL = URL + "zip=" + zip + "&";
        // TODO: bound input and strip for XSS attacks
    }

    if(county){
        URL = URL + "cty=" + county + "&";
        // TODO: strip for XSS attacks
    }

    if(queries){
        URL = URL + "q=" + queries;
        // TODO: strip for XSS attacks
    }

    window.location.href = URL;
});

// TODO: figure out how to use url parameters to transfer zip/county between pages
// ^^ https://www.sitepoint.com/get-url-parameters-with-javascript/ ^^