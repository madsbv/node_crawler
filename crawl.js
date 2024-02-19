const { JSDOM } = require("jsdom");

// Throws error if url is not a valid input to URL
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
    try {
      let urlOBJ = new URL(relURL, baseURL);
      URLs.push(urlOBJ.href);
    } catch (err) {
      console.log(
        `URL parsing error at domain ${baseURL} linking to ${relURL}`,
      );
    }
  }
  return URLs;
}

async function crawlPage(baseURL, currentURL, pages) {
  let normCurURL;
  let normBaseURL;
  try {
    let curURLObj = new URL(currentURL);
    let baseURLObj = new URL(baseURL);
    normCurURL = normalizeURL(currentURL);
    normBaseURL = normalizeURL(baseURL);
    if (curURLObj.hostname != baseURLObj.hostname) {
      // We've left the target domain
      return pages;
    }
  } catch (err) {
    console.log(err);
    console.log(
      `One of these URLs are probably invalid: \n ${baseURL} \n ${currentURL}`,
    );
    if ("URL parsing error" in pages) {
      pages["URL parsing error"] += 1;
    } else {
      pages["URL parsing error"] = 1;
    }
    return pages;
  }

  if (normCurURL in pages) {
    // Wait a minute, we've been here before...
    pages[normCurURL] += 1;
    return pages;
  }
  if (normCurURL == normBaseURL) {
    // This is the root call to crawlPage
    pages[normBaseURL] = 0;
  } else {
    pages[normCurURL] = 1;
  }

  // console.log(`Crawling ${normCurURL}`);

  let response;
  let text;
  try {
    response = await fetch(currentURL);
    text = await response.text();
  } catch (err) {
    if ("fetch error" in pages) {
      pages["fetch error"] += 1;
    } else {
      pages["fetch error"] = 1;
    }
    return pages;
  }
  if (response.status >= 400) {
    console.log(
      `Server at ${normCurURL} returned error code ${response.status}.`,
    );
    if ("server error" in pages) {
      pages["server error"] += 1;
    } else {
      pages["server error"] = 1;
    }
    return pages;
  }
  let type = response.headers.get("Content-Type");
  if (!type || !type.includes("text/html")) {
    console.log(`Wrong content-type at ${normCurURL}: ${type}`);
    if ("non-html content" in pages) {
      pages["non-html content"] += 1;
    } else {
      pages["non-html content"] = 1;
    }
    return pages;
  }

  // We should now have valid html
  let urls = getURLsFromHTML(text, baseURL);

  let futures = [];
  for (let url of urls) {
    futures.push(crawlPage(baseURL, url, pages));
  }
  for (let f of futures) {
    try {
      pages = await f;
    } catch (err) {
      console.log(`Something unexpected went wrong at ${currentURL}`);
      return pages;
    }
  }
  return pages;
}

module.exports = {
  normalizeURL,
  getURLsFromHTML,
  crawlPage,
};
