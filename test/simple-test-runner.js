var TEST_REGEXP = /(spec|test)\.html$/i;
var tests = [];
Object.keys(window.__karma__.files).forEach(function (file) {
    if (TEST_REGEXP.test(file)) {
        tests.push(file);
    }
});

var iframe = document.createElement("iframe");
window.runNextTest = function() {
    runTest();
};

document.body.appendChild(iframe);
window.__karma__.start = function() {
    runTest();
};

function runTest() {
    if (tests && tests.length > 0) {
        iframe.src = tests.shift();
    } else {
        window.__karma__.complete();
    }
}

