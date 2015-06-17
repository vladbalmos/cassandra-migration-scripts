#!/usr/bin/env node
'use strict';
  
var path = require('path');
var fs = require('fs');
var argv = require('minimist')(process.argv.slice(2));
var utils = require('./utils');

validateArguments(argv);
copyKeyspace(argv);

function copyKeyspace(argv)
{
  var src = argv.src;
  var dst = argv.dst;

  var absoluteSrc = path.resolve(src);
  var absoluteDst = path.resolve(dst);

  var keyspaceOptions = {
    snapshot: argv.snapshot
  };

  var dstKeyspaceDir;

  if (!utils.directoryExists(absoluteDst)) {
    dstKeyspaceDir = absoluteDst;
  } else {
    dstKeyspaceDir = path.join(absoluteDst, path.basename(absoluteSrc));
  }
  utils.mkdir(dstKeyspaceDir);

  foreachColumnfamily(absoluteSrc, function (err, cf) {
    if (err) {
      throw err;
    }

    cf.keyspace = path.basename(absoluteSrc);
    copyColumnFamily(cf, dstKeyspaceDir);
  }, keyspaceOptions);
}

function copyColumnFamily(srcCfData, keyspaceDir)
{
  var cfPath = path.join(keyspaceDir, srcCfData.name);
  utils.mkdir(cfPath);

  var stripPrefix = srcCfData.keyspace + '-';
  var dstKeyspaceName = path.basename(keyspaceDir);

  for (var index in srcCfData.files) {
    var srcFile = srcCfData.files[index];
    var srcFilepath = path.join(srcCfData.path, srcFile);

    if (!utils.isFile(srcFilepath)) {
      console.warn("Skipping " + srcFilepath);
      continue;
    }

    var dstFile = dstKeyspaceName + "-" + srcFile.substr(stripPrefix.length);
    var dstFilepath = path.join(cfPath, dstFile);
    fs.writeFileSync(dstFilepath, fs.readFileSync(srcFilepath));
  }
}

function foreachColumnfamily(keyspacePath, callback, options) 
{
  var snapshot = options.snapshot || false;

  fs.readdir(keyspacePath, function (err, files) {
    if (err) {
      throw err;
    }
    for(var index in files) {
      var dir = files[index];
      var dirFullPath = path.join(keyspacePath, dir);

      if (!utils.directoryExists(dirFullPath)) {
        continue;
      }

      var cf = {
        name: dir,
        path: dirFullPath,
        snapshot: snapshot
      };
      statColumnFamily(cf, callback);
    }
  });
}

function statColumnFamily(cf, callback) 
{
  var fullPath = cf.path;

  if (cf.snapshot) {
    fullPath = path.join(fullPath, 'snapshots', cf.snapshot.toString());
  }

  if (!utils.directoryExists(fullPath)) {
    console.warn("CF/snapshot data dir not found: " + fullPath);
    return;
  }

  var cfFiles = fs.readdirSync(fullPath);

  var cfData = {
    files: cfFiles,
    name: cf.name,
    path: fullPath
  };

  callback(null, cfData);
}

function validateArguments(argv) 
{
  if (typeof(argv.src) !== 'string') {
    showUsage();
    utils.scriptExit("Provided the path to the source keyspace", -1);
  }

  if (typeof(argv.dst) !== 'string') {
    showUsage();
    utils.scriptExit("Provide the path to the destination keyspace", -1);
  }

  var src = argv.src;
  var dst = argv.dst;

  if (!utils.directoryExists(src)) {
    showUsage();
    utils.scriptExit("Source keyspace must be a directory!", -1);
  }
}


function showUsage()
{
  var filename = path.basename(__filename);
  console.log("Usage:");
  console.log("\t" + filename + " --src=path/to/src/keyspace --dst=path/to/dst/keyspace [--snapshot=snapshot-timestamp]");
}


//# vim: tabstop=2 shiftwidth=2
