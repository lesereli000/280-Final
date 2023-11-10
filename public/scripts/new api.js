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

            console.log("Filters: " + request.query);

            const search = filters.search;
            const range = filters.range;
            const zipcode = filters.zipcode;
            const county = filters.county;

            delete filters.search;
            delete filters.range;
            delete filters.zipcode;
            delete filters.county;

            console.log("Search: " + search);
            console.log("Range: " + range);
            console.log("Zipcode: " + zipcode);
            console.log("County: " + county);

            // TODO: implement search parameter

            data = JSON.parse(data)
            const filtered = data.filter(obj => {
                let valid = false;
                // note this will only do filters where we have an exact vaue to match, it will not do a range
                for (key in filters) {
                    valid = valid && obj[key] == filters[key];
                }
                return valid;
            });
            console.log("filtered");
            response.set('Access-Control-Allow-Origin', '*');
            response.send(filtered);
        }
    });
});