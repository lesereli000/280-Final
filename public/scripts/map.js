const slider = document.getElementById("dist");
const output = document.getElementById("distLabel");
output.innerHTML = `Max Distance: ${slider.value} Miles`;

slider.oninput = function(){
    output.innerHTML = `Max Distance: ${this.value} Miles`;
}

const subcats = document.querySelectorAll(".taxon-sub-cat-btn");

// for (const subcat of subcats) {
//     subcat.onclick = function() {
//         const siblings = this.parentElement.children;
//         for (let k = 0; k < siblings.length; k++) {
//             if (siblings[k].classList.contains("active")) {
//                 siblings[k].classList.remove("active");
//             }
//         }
//         this.classList.add("active");
//     };
// }

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
        // console.log(activeFilters);
    };
}

const headers = document.querySelectorAll(".taxon-header");

for (const header of headers){
    header.onclick = function(){
        activeFilters = [];
        // console.log(activeFilters);
        for(const subcat of document.querySelectorAll(`${this.dataset.bsTarget} button`)){
            subcat.classList.remove("active");
            // console.log(subcat);
        }
        // console.log();
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


// TODO: data API implementation
// TODO: utilize geocoding API
// TODO: implement result filtering
// TODO: add locations to map
// TODO: create modal to pop up on location