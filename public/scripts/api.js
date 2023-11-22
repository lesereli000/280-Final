const express = require('express');
const app = express();
app.use(express.json());
const dataPath = "../../Real_Data/realResources.json";
const fs = require('fs');

let port = 3000;
app.listen(port, () => {
    console.log("Listening on PORT:", port)
});

app.get("/", async (request, response) => {
    fs.readFile(dataPath, async (err, data) => {
        if (err) {
            console.log(err);
        } else {
            let filters = request.query;

            const search = filters.search;
            delete filters.search;
            let zipcodes = "";
            if (filters.zipcode) {
                zipcodes = filters.zipcode.split(", ");
            }
            let counties = "";
            if (filters.county) {
                counties = filters.county.split(", ");
            }

            const activeFilters = filters.filters;
            delete filters.filters;

            const range = Number(filters.range);
            delete filters.range;

            data = JSON.parse(data)
            const filtered = data.filter(obj => {
                let valid = true;
                let foundOneZip = false;
                if (zipcodes.length != 0) {
                    for (let i = 0; i < zipcodes.length; i++) {
                        foundOneZip = foundOneZip || obj["zipcode"] == zipcodes[i];
                    }
                } else {
                    foundOneZip = true;
                }
                let foundOneCounty = false;
                if (counties.length != 0) {
                    for (let i = 0; i < counties.length; i++) {
                        foundOneCounty = foundOneCounty || obj["county"] == counties[i];
                    }
                } else {
                    foundOneCounty = true;
                }

                valid = valid && foundOneZip && foundOneCounty;
                return valid;
            });

            const filtered2 = await Promise.all(filtered.map(async obj => {
                let valid = true;

                const coords = await getCoords(obj);

                obj.longitude = coords.lng;
                obj.latitude = coords.lat;

                let inSomeDistance = false;
                if (zipcodes != "") {
                    for (let i = 0; i < zipcodes.length; i++) {
                        var macroData = zipcodes[i];
                        const distance = await getDistance(obj, macroData);
                        if (isNaN(distance)) {
                            inSomeDistance = false;
                            break;
                        }
                        inSomeDistance = inSomeDistance || distance <= range;
                    }
                    var macroData = zipcodes[1];
                } else {
                    for (let i = 0; i < counties.length; i++) {
                        var macroData = counties[i] + "%20County%IN";
                        const distance = await getDistance(obj, macroData);
                        if (isNaN(distance)) {
                            inSomeDistance = false;
                            break;
                        }
                        inSomeDistance = inSomeDistance || distance <= range;
                    }
                }
                return inSomeDistance;
            }));

            // TODO: See if crossing the county is worth it. I think it will slow the algorithm down too much to be useful and vote no.

            const postFiltered2 = filtered.filter((_, index) => filtered2[index]);

            let postFiltered3;

            if (search) {
                let searchTerms = search.split(", ");

                const filtered3 = await Promise.all(postFiltered2.map(async obj => {
                    let valid = false;

                    searchTerms.forEach((term) => {
                        valid = valid || obj["agency_name"].toLowerCase().includes(term.toLowerCase());
                        valid = valid || obj["agency_desc"].toLowerCase().includes(term.toLowerCase());
                        valid = valid || obj["city"].toLowerCase().includes(term.toLowerCase());
                        valid = valid || obj["service_name"].toLowerCase().includes(term.toLowerCase());
                        valid = valid || obj["service_description"].toLowerCase().includes(term.toLowerCase());
                        valid = valid || obj["taxonomy_name"].toLowerCase().includes(term.toLowerCase());
                        valid = valid || obj["taxonomy_category"].toLowerCase().includes(term.toLowerCase());
                        valid = valid || obj["nameLevel2"].toLowerCase().includes(term.toLowerCase());
                        valid = valid || obj["nameLevel3"].toLowerCase().includes(term.toLowerCase());
                        valid = valid || obj["nameLevel4"].toLowerCase().includes(term.toLowerCase());
                        valid = valid || obj["nameLevel5"].toLowerCase().includes(term.toLowerCase());
                    });

                    return valid;
                }));

                postFiltered3 = postFiltered2.filter((_, index) => filtered3[index]);
            } else {
                postFiltered3 = postFiltered2;
            }

            let finalFiltered;
            if (activeFilters) {
                filters = activeFilters.split(",");
                const filtered4 = await Promise.all(postFiltered3.map(async obj => {
                    let valid = false;

                    filters.forEach((filter) => {
                        valid = valid || obj["taxonomy_category"] == filter;
                        valid = valid || obj["nameLevel2"] == filter;
                    });

                    return valid;
                }));

                finalFiltered = postFiltered3.filter((_, index) => filtered4[index]);
            } else {
                finalFiltered = postFiltered3;
            }

            const mergedFinalFiltered = finalFiltered.reduce((acc, current) => {
                const x = acc.find(item => {
                    if (item.site_id === current.site_id) {
                        item.service_id = `${item.service_id}, ${current.site_id}`;
                        item.service_name = `${item.service_name}, ${current.service_name}`;
                        item.service_description = `${item.service_description}, ${current.service_description}`;
                        item.taxonomy_code = `${item.taxonomy_code}, ${current.taxonomy_code}`;
                        item.taxonomy_category = `${item.taxonomy_category}, ${current.taxonomy_category}`;
                        item.nameLevel2 = `${item.nameLevel2}, ${current.nameLevel2}`;
                        item.nameLevel3 = `${item.nameLevel3}, ${current.nameLevel3}`;
                        item.nameLevel4 = `${item.nameLevel4}, ${current.nameLevel4}`;
                        item.nameLevel5 = `${item.nameLevel5}, ${current.nameLevel5}`;
                        item.taxonomy_name = `${item.taxonomy_name}, ${current.taxonomy_name}`;
                        return true;
                    } else {
                        return false;
                    }
                });
                if (!x) {
                    return acc.concat([current]);
                } else {
                    return acc;
                }
            }, []);

            response.set('Access-Control-Allow-Origin', '*');
            response.send(mergedFinalFiltered);
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

    return fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${filteredAddress}&key=AIzaSyD190DfFJZ9FUhKxQ7OPutlmTAcFKjIgV0`)
        .then(response => response.json())
        .then(data => {
            if (data.status === "ZERO_RESULTS") {
                return coords = { lat: 0, lng: 0 }
            }
            coords = { lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng };
            return coords;
        })
        .catch(error => {
            coords = { lat: 0, lng: 0 };
            return coords;
        });

}

async function getDistance(obj, macroData) {
    let distance = 1000;

    return fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${obj.latitude},${obj.longitude}&origins=${macroData}&units=imperial&key=AIzaSyD190DfFJZ9FUhKxQ7OPutlmTAcFKjIgV0`)
        .then(response => response.json())
        .then(data => {
            if (data.rows[0].elements[0].status === "ZERO_RESULTS" || data.rows[0].elements[0].status === "NOT_FOUND") {
                return 1000;
            }
            distance = data.rows[0].elements[0].distance.text;
            distance = distance.replace(" mi", "");
            return Number(distance);
        })
        .catch(error => {
            return Number(1000);
        });
}
