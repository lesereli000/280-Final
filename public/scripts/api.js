const express = require('express');
const app = express ();
// app.use(cors());
app.use(express.json());
const dataPath = "Real_Data/realResources.json";
const fs = require('fs');

let port = 3000;
app.listen(port, () => {
    console.log("Listening on PORT:", port)
});

app.get("/", (request, response) =>{
    fs.readFile(dataPath, (err, data) => {
        if(err){
            console.log(err);
        } else {
            console.log("read success");
            const filters = request.query;
            data = JSON.parse(data)
            const filtered = data.filter( obj => {
                let valid = true;
                // note this will only do filters where we have an exact vaue to match, it will not do a range
                for(key in filters){
                    // console.log(key, obj[key], filters[key]); 
                    valid = valid && obj[key] == filters[key];
                }
                return valid;
            });
            console.log("filtered");
            response.set('Access-Control-Allow-Origin', '*');
            response.send(filtered);
            // response.send(data);
        }
    });
});