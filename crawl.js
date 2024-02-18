const { JSDOM } = require("jsdom");

function normalizeURL(url) {
  let urlObj = new URL(url);
  let result = urlObj.hostname;
  let path = urlObj.pathname;
  if (path.length > 1) {
    result += path;
  }
  if (result.slice(-1) == "/") {
    result = result.slice(0, -1);
  }
  return result;
}

function getURLsFromHTML(htmlBody, baseURL) {
  let dom = new JSDOM(htmlBody);
  let aTags = dom.window.document.querySelectorAll("a");
  let URLs = [];
  for (let aTag of aTags) {
    let relURL = aTag.href;
    let urlOBJ = new URL(relURL, baseURL);
    URLs.push(urlOBJ.href);
  }
  return URLs;
}

module.exports = {
  normalizeURL,
  getURLsFromHTML,
};
