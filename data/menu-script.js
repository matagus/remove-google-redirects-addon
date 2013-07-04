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
    return undefined;
  else
    return decodeURIComponent(results[1]);
}

var removeRedirects = function (link) {
  // get the url query string
  // and then set the anchor href to the url param value
  var url = getURLparam(link.href, "url");

  if (url === undefined) {
    // Custom embedded search case
    url = getURLparam(link.href, "q");
  }

  if (url === undefined) return;
  link.href = url;
};

var removeImageRedirects = function (link) {
  // get the url query string
  // and then set the anchor href to the url param value
  var url = getURLparam(link.href, "imgurl");
  if (url === undefined) return;
  link.href = url;
};
 
self.on("context", function (node) {
  
  var fixNode = node;
  if (fixNode.nodeName != "A") { fixNode = node.parentElement; }

  // FIXME: this reg exp should be reused from lib/main.js but I didnt find the way
  if (/http(s)?:\/\/((www|encrypted|news|images)\.)?google\.(.*?)\/url\?/.test(fixNode.href)) {
    // remove redirects from clicked anchor
    removeRedirects(fixNode);
  };
  
  if (/http(s)?:\/\/((www|encrypted|news|images)\.)?google\.(.*?)\/imgres\?/.test(fixNode.href)) {
    // remove redirects from clicked image
    removeImageRedirects(fixNode);
  };

  // never show this context menu item
  return false;
});
