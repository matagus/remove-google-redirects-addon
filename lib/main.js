var pageMod = require("page-mod");
var data = require("self").data;

var workers = [];

var watcherMod = pageMod.PageMod({
  include: ["http://google.*", "http://www.google.*", "https://google.*",
    "https://www.google.*", "https://encrypted.google.*",
    "http://encrypted.google"],
  contentScriptWhen: 'end',
  contentScriptFile: data.url("google.js"),
  onAttach: function onAttach(worker) {
    workers.push(worker);
  }
});
