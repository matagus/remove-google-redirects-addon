console.debug("included data/clicked-link.js");

document.addEventListener("click",  function(event) {
  var value = RegExp("url" +"[^&]+").exec(event.target.search);
  if (value) {
    var url = String(value).split("=")[1];
    if (url) {
      event.target.href = decodeURIComponent(url);
    }
  }
});
