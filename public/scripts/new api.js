const express = require('express');
const app = express();
app.use(express.json());
const dataPath = "../../Real_Data/realResources.json";
const fs = require('fs');

let port = 3000;
app.listen(port, () => {
    console.log("Listening on PORT:", port)
});

const bodyParser = require('body-parser')


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))


app.get("/", (request, response) => {
    fs.readFile(dataPath, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            console.log("read success");
            let filters = request.query;

            const search = filters.search;
            delete filters.search;

            const zipcode = filters.zipcode;
            const county = filters.county;

            const range = filters.range;
            delete filters.range;


            // console.log("Search: " + search);
            // console.log("Range: " + range);
            // console.log("Zipcode: " + zipcode);
            // console.log("County: " + county);

            // TODO: implement search parameter

            data = JSON.parse(data)
            const filtered = data.filter(obj => {
                let valid = true;

                const longLat = getLongLat(obj);

                for (key in filters) {

                    valid = valid && obj[key] == filters[key]
                }
                return valid;
            });
            console.log("filtered");
            response.set('Access-Control-Allow-Origin', '*');
            response.send(filtered);
        }
    });
});

async function getLongLat(obj) {
    fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=`)
        .then(response => response.json())
        .then(data => {
        
        })
        .catch(error => {
            console.log(error);
    })
}