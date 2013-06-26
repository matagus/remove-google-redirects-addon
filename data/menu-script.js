function getURLparam(url, name) {
  /* 
  given an url and a param name it gets the value
  of the named param in the query string part of the url
  */
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec(url);
  if( results == null )
    return "";
  else
    return decodeURIComponent(results[1]);
}

var removeRedirects = function (link) {
  // get the url query string
  // and then set the anchor href to the url param value
  link.href = getURLparam(link.href, "url");
};
 
self.on("context", function (node) {
  if (node.nodeName != "A") { node = node.parentElement; }

  // FIXME: this reg exp should be reused from lib/main.js but I didnt find the way
  if (/http(s)?:\/\/((www|encrypted|news|images)\.)?google.(.*?)\/url\?/.test(node.href)) {
    // remove redirects from clicked anchor
    removeRedirects(node);
  };
  // never show this context menu item
  return false;
});
