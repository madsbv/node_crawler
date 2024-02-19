function printReport(pages) {
  let report = "Starting report.\n ------------ \n";
  for (let [url, nlinks] of sortPages(pages)) {
    report += `Found ${nlinks} internal links to ${url}\n`;
  }
  return report;
}

function sortPages(pages) {
  return Object.entries(pages)
    .toSorted() // Sort alphabetically on the url
    .toSorted((a, b) => b[1] - a[1]); // Then by number of links
}

module.exports = {
  printReport,
};
