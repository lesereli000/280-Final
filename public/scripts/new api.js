const express = require('express');
const app = express();
app.use(express.json());
const dataPath = "../../Real_Data/realResources.json";
const fs = require('fs');

let port = 3000;
app.listen(port, () => {
    console.log("Listening on PORT:", port)
});

let zipcode = 0;
let county = "";

app.get("/", (request, response) => {
    fs.readFile(dataPath, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log("read success");
            let filters = request.query;

            const search = filters.search;
            delete filters.search;

            zipcode = filters.zipcode;
            county = filters.county;

            const range = Number(filters.range);
            delete filters.range;

            // TODO: implement search parameter

            data = JSON.parse(data)
            const filtered = data.filter(obj => {
                let valid = true;

                for (key in filters) {

                    valid = valid && obj[key] == filters[key]
                }
                return valid;
            });
            console.log("filtered part 1");

            const filtered2 = filtered.filter(async obj => {
                let valid = true;

                const coords = await getCoords(obj);

                obj.longitude = coords.lng;
                obj.latitude = coords.lat;

                const distance = await getDistance(obj);

                if (isNaN(distance)) {
                    return false;
                }
                return distance <= range;
 
            });
            response.set('Access-Control-Allow-Origin', '*');
            response.send(filtered);
            console.log("All done!")
        }
    });
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
    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${filteredAddress}&key=AIzaSyBPtQdhjLymTBQq5kKId0mO1Wjq6vFh6PY`)
        .then(response => response.json())
        .then(data => {
            coords = { lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng };
            return coords;
        });
}

async function getDistance(obj) {
    let distance = 1000;

    if (zipcode != undefined) {
        var macroData = zipcode;
    } else {
        var macroData = county;
    }

    console.log(obj.latitude);
    console.log(obj.longitude);
    
    return fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${obj.latitude},${obj.longitude}&origins=${macroData}&units=imperial&key=AIzaSyBPtQdhjLymTBQq5kKId0mO1Wjq6vFh6PY`)
        .then(response => response.json())
        .then(data => {
            if (data.rows[0].elements[0].status === "ZERO_RESULTS") {
                return 1000;
            }
            distance = data.rows[0].elements[0].distance.text;
            distance = distance.replace(" mi", "");
            return Number(distance);
        });
}
