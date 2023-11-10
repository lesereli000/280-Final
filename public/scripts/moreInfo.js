/* TODO: Make print view look really nice (table?) */
/* TODO: Make it so you can export a CSV */
/* TODO: Modal to decide between these */
/* TODO: Choose div from cards that we want to display/print */

function printContent(divId) {
    var printContents = document.getElementById(divId).innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
}

