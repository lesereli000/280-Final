const printCardBtn = document.getElementById("printCardBtn");
const printSelectBtn = document.getElementById("printSelectBtn");
const printAllBtn = document.getElementById("printAllBtn");


let selectedArray = [];

function printContent(divId) {
    var printContents = document.getElementById(divId).innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
}