const slider = document.getElementById("dist");
const output = document.getElementById("distLabel");
output.innerHTML = `Max Distance: ${slider.value} Miles`;

slider.oninput = function(){
    output.innerHTML = `Max Distance: ${this.value} Miles`;
}

const subcats = document.querySelectorAll(".taxon-sub-cat-btn");

for (const subcat of subcats) {
    subcat.onclick = function() {
        const siblings = this.parentElement.children;
        for (let k = 0; k < siblings.length; k++) {
            if (siblings[k].classList.contains("active")) {
                siblings[k].classList.remove("active");
            }
        }
        this.classList.add("active");
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
// TODO: be able to unselect subcat