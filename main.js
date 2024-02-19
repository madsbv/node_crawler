const { normalizeURL, getURLsFromHTML, crawlPage } = require("./crawl.js");
const { printReport } = require("./report.js");
const { argv } = require("node:process");

async function main() {
  // - Test that #CLI-arguments == 1, else error
  // - If there's exactly one CLI argument, assume it's the baseURL and print a message indicating that crawling is starting at that URL
  if (argv.length != 3) {
    console.log(`Wrong number of arguments ${argv.length - 2}, should be 1`);
    return;
  }
  let baseURL = argv[2];
  console.log(`Starting crawler at ${baseURL}`);
  let pages = await crawlPage(baseURL, baseURL, {});
  let report = printReport(pages);
  console.log(report);
}

main();
