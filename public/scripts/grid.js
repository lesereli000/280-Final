const printCardBtn = document.getElementById("printCardBtn");
const printSelectBtn = document.getElementById("printSelectBtn");
const printAllBtn = document.getElementById("printAllBtn");

const subcats = document.querySelectorAll(".taxon-sub-cat-btn");

let selectedArray = [];

function printContent(divId) {
    var printContents = document.getElementById(divId).innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
}

function printExternal(divId) {
    var printWindow = window.open( myWindow, "moreInfo.html"); 
    var printContents = printWindow.getElementById(divId).innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
}

/*for (const subcat of subcats){
    subcat.onclick = function() {
        this.classList.toggle("active");
        if (this.classList.contains("active")){
            activeFilters.push(this.textContent);
        } else {
            activeFilters[activeFilters.indexOf(this.textContent)] = undefined;
            activeFilters = cleanArray(activeFilters);
        }
        console.log(activeFilters);
    };
}*/

async function fetchData() {
    try {
        // let queryString = "";

        // queryString += `range=${slider.value}&`;
        
        // if(activeFilters.length != 0){
        //     queryString += `filters=[${activeFilters}]&`
        // }
    
        // if(search.value){
        //     queryString += `search=${search.value}`;
        // }
    
        // console.log(queryString);
    
        // if(zip){
        //     queryString += `zipcode=${zip}`;
        // } else if (county) {
        //     queryString += `county=${county}`;
        // }
        const response = await fetch(`http://localhost:3000/?zipcode=47803`);
        const data = await response.json;
        console.log(response);
        return response;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

async function displayCards() {
    const container = document.querySelector('.container');
    const data = await fetchData();

    if (!data) {
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('card');

        const title = document.createElement('h1');
        title.textContent = item.site_name;

        const subtitle = document.createElement('h2');
        subtitle.textContent = item.agency_name;

        const body = document.createElement('p');
        body.textContent = item.agency_desc;

        card.appendChild(title);
        card.appendChild(body);
        container.appendChild(card);
    });
}

displayCards();

