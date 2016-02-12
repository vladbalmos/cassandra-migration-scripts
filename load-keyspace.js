#!/usr/bin/env node
'use strict';
  
require('shelljs/global');
var path = require('path');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var utils = require('./utils');

validateArguments(argv);
loadKeyspace(argv);

function loadKeyspace(argv)
{
    var keyspaceDir = argv.keyspaceDir;
    var sstableloader = argv.sstableloader;
    var initialHost = argv.host || '127.0.0.1';
    var initialPort = argv.port || 9160;

    keyspaceDir = path.resolve(keyspaceDir);
    sstableloader = path.resolve(sstableloader);

    var keyspaceName = path.basename(keyspaceDir);

    var processOptions = {
        cwd: path.dirname(keyspaceDir),
    };

    console.log('Changing directory to ' + keyspaceDir);
    cd(path.dirname(keyspaceDir));
    fs.readdir(keyspaceDir, function (err, filesList) {
        for (var index in filesList) {
            var cfName = filesList[index];
            var cf = path.join(keyspaceName, cfName);
            var command = sstableloader + " -d " + initialHost + " -p " + initialPort + ' ' + cf;
            console.log(command);

            var execStatus = exec(command);
            console.log(execStatus);
        }
    });
}

function validateArguments(argv)
{
    if (typeof(argv.keyspaceDir) !== 'string') {
        showUsage();
        utils.scriptExit("Please provide the path to the keyspaceDir", -1);
    }

    if (!utils.directoryExists(argv.keyspaceDir)) {
        showUsage();
        utils.scriptExit("Keyspace directory does not exist!", -1);
    }

    if (typeof(argv.sstableloader) !== 'string') {
        showUsage();
        utils.scriptExit("Please provide the path to the sstableloader binary", -1);
    }

    if (!utils.isFile(argv.sstableloader)) {
        showUsage();
        utils.scriptExit("sstableloader not found!", -1);
    }
}

function showUsage()
{
  var filename = path.basename(__filename);
  console.log("Usage:");
  console.log("\t" + filename + " --keyspaceDir=path/to/src/keyspace --sstableloader=path/to/sstableloader [--host=127.0.0.1] [--port 9160]");
}

//# vim: tabstop=2 shiftwidth=2
