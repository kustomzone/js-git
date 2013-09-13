var platform = require('git-node-platform');
var jsGit = require('../.')(platform);
var fsDb = require('git-fs-db')(platform);
var fs = platform.fs;

// Create a filesystem backed bare repo
var repo = jsGit(fsDb(fs("test.git")));
repo.log("HEAD", function (err, log) {
  if (err) throw err;
  return log.read(onRead);

  function onRead(err, commit) {
    if (err) throw err;
    if (!commit) return;
    logCommit(commit);
    repo.tree(commit.body.tree, function (err, tree) {
      if (err) throw err;
      tree.read(onEntry);
      function onEntry(err, entry) {
        if (err) throw err;
        if (!entry) {
          console.log();
          return log.read(onRead);
        }
        logEntry(entry);
        return tree.read(onEntry);
      }
    });
  }
});

function logCommit(commit) {
  var author = commit.body.author;
  var message = commit.body.message;
  console.log("\x1B[33mcommit %s\x1B[0m", commit.hash);
  console.log("Author: %s <%s>", author.name, author.email);
  console.log("Date:   %s", author.date);
  console.log("\n    \x1B[32;1m" + message.trim().split("\n").join("\x1B[0m\n    \x1B[32m") + "\x1B[0m\n");
}

function logEntry(entry) {
  // if (entry.type === "blob") {
    var path = entry.path.replace(/\//g, "\x1B[1;34m/\x1B[0;34m") + "\x1B[0m";
    console.log(" %s %s", entry.hash, path);
  // }
}