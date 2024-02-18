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

async function crawlPage(url) {
  // 1. Fetch webpage
  // 2. Print error and return if we hit a 400+ code
  // 3. If content-type is not text/html, print error and return
  // 4. Print HTML body and be done

  let response;
  let text;
  try {
    response = await fetch(url);
    text = await response.text();
  } catch (err) {
    console.log(err);
    return;
  }
  if (response.status >= 400) {
    console.log(`Server at ${url} returned error code ${response.status}.`);
    return;
  }
  let type = response.headers.get("Content-Type");
  if (!type.includes("text/html")) {
    console.log(`Wrong content-type at ${url}: ${type}`);
    return;
  }

  console.log(text);
}

module.exports = {
  normalizeURL,
  getURLsFromHTML,
  crawlPage,
};
