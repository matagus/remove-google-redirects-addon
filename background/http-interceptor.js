const GOOGLE_REGEXP = /http(s)?:\/\/((www|encrypted|news|images)\.)?google\.(.*?)\/url\?/;
const GOOGLE_IMGRES_REGEXP = /http(s)?:\/\/(.*?\.)?google\.(.*?)\/imgres\?/;
const GOOGLE_PLUS_REGEXP = /http(s)?:\/\/plus.url.google.com\/url\?/;

function isValidURI(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

function logURL(requestDetails) {
  const url = requestDetails.url;
  let isSearchResult = GOOGLE_REGEXP.test(url);
  let isImageSearchResult = GOOGLE_IMGRES_REGEXP.test(url);
  let isGooglePlusRedirect = GOOGLE_PLUS_REGEXP.test(url);
  let aggresiveWithImageUrls = true; // TODO

  if (isSearchResult || (isImageSearchResult && aggresiveWithImageUrls) || isGooglePlusRedirect) {
    console.log("Canceling: " + requestDetails.url);

    // get the query string part of the url
    let position = url.indexOf("?") + 1;
    let qs = url.slice(position);
    let parsed_qs = new URLSearchParams(qs);

    let to_url;

    if (isSearchResult || isGooglePlusRedirect) {
      if (parsed_qs.has("q")) {
        // On custom embedded searches Google uses q params instead of url
        // See for instance: http://www.google.com/cse/publicurl?cx=005900015654567331363:65whwnpnkim
        if (isValidURI(parsed_qs.get("q"))) {
          to_url = parsed_qs.get("q");
        }
      }

      if (parsed_qs.has("url")) {
        if (isValidURI(parsed_qs.get("url"))) {
          to_url = parsed_qs.get("url");
        }
      }
    } else {
      // isImageSearchResult is true
      console.log("Image!");
      if (parsed_qs.has("imgurl")) {
        if (isValidURI(parsed_qs.get("imgurl"))) {
          to_url = parsed_qs.get("imgurl");
        }
      }
    }

    console.log("Opening: " + to_url);

    if (requestDetails.type != "sub_frame") {
      return {
        redirectUrl: to_url
      };
    }

    browser.tabs.update(requestDetails.tabId, {url: to_url});
    return {cancel: true};
  }

}

browser.webRequest.onBeforeRequest.addListener(
  logURL,
  {
    urls: ["<all_urls>"]
  },
  ["blocking"]
);