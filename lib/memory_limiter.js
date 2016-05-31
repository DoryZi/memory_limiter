/******
 * module to that uses the cluster and status to check memory of a process and restart it once reaching a certain size.
 * This module is a patch for finding resource / memory leaks. Will not work on windows. only status supports systems.
 * @type {*|exports}
 */

var displayInfo = process.env.MEM_LIMIT_SHOW_INFO;
var cluster = require('cluster');
module.exports = {
    /**
     * is this is the master process will create the observing process otherwise will create a child process.
     * When the process memory reachs the limit ti will kill itself gracefully, meaning will run any cleanup code
     * and allow the process 30 seconds to finish that code.
     * @param memoryCheckIntervalTimeout - how oftern in miliseconds should the process check it's memory
     * @param memoryLimitInBytes - the limit afterwhich the process should restart in bytes
     * @param mainCodeFunction - the main child process code
     * @param exitCleanupCodeFunction - the cleanup code that should be run when reaching the max memory
     */
    limitProcessMemory : function (memoryCheckIntervalTimeout, memoryLimitInBytes, mainCodeFunction ,exitCleanupCodeFunction) {
        if (cluster.isMaster) {
            console.log("running main process");
            cluster.fork();
            //if the worker dies, restart it.
            cluster.on('disconnect', function(worker){
                console.log('MEMORY: Worker ' + worker.id + ' disconnected, launch a new process..');
                cluster.fork();
            });
        } else {
            mainCodeFunction();
            // only exist in production / staging

            var usage = require('usage');
            var dying = false;
            setInterval(function () {
                var pid = process.pid // you can use any valid PID instead
                usage.lookup(pid, function(err, result) {
                    if (result === null || result === undefined) {
                        console.log("MEMORY memory check result is null");
                        return;
                    }
                    if (displayInfo) console.log ("MEMORY IS" + result.memory);
                    if (parseInt(result.memory) > memoryLimitInBytes  && dying === false) {
                        console.log("MEMORY exceeded kill the process");
                        // run time, so we will have time to cleanup.
                        var killtimer = setTimeout(function() {
                            console.log("MEMORY process dying NOW!")
                            process.exit(1);
                        }, 30000);
                        // But don't keep the process open just for that!
                        killtimer.unref();
                        if (exitCleanupCodeFunction) exitCleanupCodeFunction();
                        try {
                            if (cluster.worker.state !== "disconnected" && cluster.worker.state !== "dead") {
                                cluster.worker.disconnect();
                            }

                        } catch (err) {};
                        dying = true;
                    }
                });
            },memoryCheckIntervalTimeout);
        }

    }
}
