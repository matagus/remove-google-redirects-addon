WebRequest.onBeforeRequest.addListener(logURL);

function logURL(e) {
  console.log("Loading: " + e.url);
}
