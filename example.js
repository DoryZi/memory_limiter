var memLimit = require('./lib/memory_limiter');

// leak object contructor
function MemoryLeakObject () {
}

// The main function to be used.
function mainFunction() {
    var everGrowingArray = [];
    setInterval(function () {
        for (var i=0; i < 1000; ++i) {
            everGrowingArray.push(new MemoryLeakObject)
        }
    },2000);
}

memLimit.limitProcessMemory (3000 /*check every three seconds */,
                             100000000 /*max process memory size in bytes*/,
                             mainFunction ,
                             function processTerminated(){ console.log("process killed")});



