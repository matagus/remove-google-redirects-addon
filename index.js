const { Cc, Ci, Cr } = require("chrome");

const GOOGLE_REGEXP = /http(s)?:\/\/((www|encrypted|news|images)\.)?google\.(.*?)\/url\?/;
const GOOGLE_IMGRES_REGEXP = /http(s)?:\/\/(.*?\.)?google\.(.*?)\/imgres\?/;
const GOOGLE_PLUS_REGEXP = /http(s)?:\/\/plus.url.google.com\/url\?/;

var core = require("sdk/view/core");
var contextmenu = require("sdk/context-menu");
var events = require("sdk/system/events");
var querystring = require("sdk/querystring");
var tabs = require("sdk/tabs");
var tabUtils = require("sdk/tabs/utils");
var utils = require("sdk/window/utils");
var isValidURI = require("sdk/url").isValidURI;
var preferences = require("sdk/simple-prefs");
var self = require("sdk/self");
var pageMod = require("sdk/page-mod");


function listener(event) {
  var channel = event.subject.QueryInterface(Ci.nsIHttpChannel);
  var url = event.subject.URI.spec;

  var aggresiveWithImageUrls = preferences.prefs.aggresiveGoogleImagesCleanup;
  var isSearchResult = GOOGLE_REGEXP.test(url);
  var isImageSearchResult = GOOGLE_IMGRES_REGEXP.test(url);
  var isGooglePlusRedirect = GOOGLE_PLUS_REGEXP.test(url);

  if (isSearchResult || (isImageSearchResult && aggresiveWithImageUrls) || isGooglePlusRedirect) {
    // abort current request
    // Ref: https://developer.mozilla.org/en-US/docs/XUL/School_tutorial/Intercepting_Page_Loads
    channel.cancel(Cr.NS_BINDING_ABORTED);

    // get the query string part of the url
    var position = url.indexOf("?") + 1;
    var qs = url.slice(position);
    parsed_qs = querystring.parse(qs);

    // get the xul tab for the active tab
    var xulTab = core.viewFor(tabs.activeTab);
    // get the XUL browser for this tab
    var xulBrowser = tabUtils.getBrowserForTab(xulTab);

    if (isSearchResult || isGooglePlusRedirect) {
      if (parsed_qs.q) {
        // On custom embedded searches Google uses q params instead of url
        // See for instance: http://www.google.com/cse/publicurl?cx=005900015654567331363:65whwnpnkim
        if (isValidURI(parsed_qs.q)) {
          console.log("[CES] URL=", url, "redirected to", parsed_qs.q);
          xulBrowser.loadURI(parsed_qs.q);
          return;
        }
      }

      if (parsed_qs.url) {
        if (isValidURI(parsed_qs.url)) {
          console.log("[URL] URL=", url, "redirected to", parsed_qs.url);
          xulBrowser.loadURI(parsed_qs.url);
          return;
        }
      }
    } else {
      // isImageSearchResult is true
      if (parsed_qs.imgurl) {
        if (isValidURI(parsed_qs.imgurl)) {
          console.log("[Image] URL=", url, "redirected to", parsed_qs.imgurl);
          xulBrowser.loadURI(parsed_qs.imgurl);
          return;
        }
      }
    }

    xulBrowser.loadURI(url);
  }
};

exports.main = function() {
  events.on("http-on-modify-request", listener);

  contextmenu.Item({
    label: "A Mozilla Image",
    context: contextmenu.SelectorContext("a"),
    contentScriptFile: self.data.url("menu-script.js")
  });

  var pageMod = require("sdk/page-mod");
  pageMod.PageMod({
    //include: /((www|encrypted|news|images)\.)?google\.(.*?)/,
    include: /http(s)?:\/\/((www|encrypted|news|images)\.)?google\..*/,
    contentScriptFile: self.data.url("clicked-link.js")
  });
};


exports.onUnload = function (reason) {
  events.off("http-on-modify-request", listener);
};

