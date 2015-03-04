memory_limiter.js
=============

Memory Limiter is a little utility library that restarts a node.js process once it reaches a certain size.
It is mainly interested for Heroku and the likes of it, once you have a resource leak and need a quick fix.
This should enable your multi dyno server to continue running while you're trying to find the leak itself and fix it.


Installing
----------
Installing Memory Limter is easy. Simply download the package from npm.

npm install memory_limit

Usage
-----
It's very simple to use as well.
You just warp all your code that runs on load in a function and pass that function the memory limiter.

var memLimit = require('./lib/memory_limiter');

then call memLimit only exported function:


memLimit.limitProcessMemory (3000 /*check every three seconds */,
                             100000000 /*max process memory size in bytes*/,
                             mainFunction /*the main function that runs your code*/
                             cleanupFunction /*after each process termination cleanupFunction will get called and have 30 seconds to finish cleaning up the process*/
                             );


