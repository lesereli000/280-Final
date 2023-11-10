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

function setPrintPage(prnThis){
 
    prnDoc = document.getElementById('info');
    prnDoc[0].setAttribute('href', prnThis);
    window.print();
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
        console.log(activeFilters);
    };
}


