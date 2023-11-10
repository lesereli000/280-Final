function printExternal(divId) {
    var printWindow = window.open( myWindow, "moreInfo.html"); 
    var printContents = printWindow.getElementById(divId).innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    printWindow.print();

    document.body.innerHTML = originalContents;
}

