var resultLinks = document.querySelectorAll("#search ol li a");

var forEach = Array.prototype.forEach; // see https://developer.mozilla.org/en/DOM/NodeList

var removeRedirects = function (resultLinks) {
  forEach.call(resultLinks, function(link){
    link.removeAttribute("onmousedown");
  });
};

removeRedirects(resultLinks);
  
var main = document.querySelector("#main");
if (main) {
  main.addEventListener("DOMSubtreeModified", function(n) {
    var resultLinks = document.querySelectorAll("#search ol li a");
    removeRedirects(resultLinks);
  });
}
