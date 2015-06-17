'use strict';

var path = require('path');
var fs = require('fs');

function directoryExists(dir)
{
  var s;
  try {
    s = fs.statSync(dir);
  } catch (e) {
    return false;
  }

  return s.isDirectory();
}

function scriptExit(msg, exitCode)
{
  exitCode = (exitCode === undefined) ? 0 : exitCode;
  if (msg) {
    if (exitCode < 0) {
      console.error(msg);
    } else {
      console.log(msg);
    }
  }
  process.exit(exitCode);
}

function mkdir(dir)
{
  if (directoryExists(dir)) {
    return;
  }

  fs.mkdirSync(dir);
}

function isFile(filepath) 
{
  var s;
  try {
    s = fs.statSync(filepath);
  } catch(e) {
    return false;
  }

  return s.isFile();
}

module.exports = {
    isFile: isFile,
    directoryExists: directoryExists,
    mkdir: mkdir,
    scriptExit: scriptExit
};
