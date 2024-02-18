const { test, expect } = require("@jest/globals");
const { normalizeURL, getURLsFromHTML } = require("./crawl.js");

// Test URL normalization
let normalization_test_cases = [
  ["https://example.com/", "example.com"],
  ["http://example.com/path/to/resource", "example.com/path/to/resource"],
  ["http://example.com/path/to/resource/", "example.com/path/to/resource"],
];
for (let [input, expected] of normalization_test_cases) {
  test(`Normalize ${input} to ${expected}`, () => {
    expect(normalizeURL(input)).toBe(expected);
  });
}

// Test URL extraction.
// Actual HTML of example.com
let example_com_html = `
<!doctype html>
<html>
<head>
    <title>Example Domain</title>

    <meta charset="utf-8" />
    <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style type="text/css">
    body {
        background-color: #f0f0f2;
        margin: 0;
        padding: 0;
        font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;

    }
    div {
        width: 600px;
        margin: 5em auto;
        padding: 2em;
        background-color: #fdfdff;
        border-radius: 0.5em;
        box-shadow: 2px 3px 7px 2px rgba(0,0,0,0.02);
    }
    a:link, a:visited {
        color: #38488f;
        text-decoration: none;
    }
    @media (max-width: 700px) {
        div {
            margin: 0 auto;
            width: auto;
        }
    }
    </style>
</head>

<body>
<div>
    <h1>Example Domain</h1>
    <p>This domain is for use in illustrative examples in documents. You may use this
    domain in literature without prior coordination or asking for permission.</p>
    <p><a href="https://www.iana.org/domains/example">More information...</a></p>
</div>
</body>
</html>
`;
let example_multiple_atags = `
<!doctype html>
<html>
<body>
<div>
    <h1>Example Domain</h1>
    <p><a href="https://www.iana.org/domains/example">More information...</a></p>
    <p><a href="https://www.google.com">More information...</a></p>
</div>
</body>
</html>
`;
let example_relative_atag = `
<!doctype html>
<html>
<body>
<div>
    <h1>Example Domain</h1>
    <p><a href="/xyz.html">More information...</a></p>
</div>
</body>
</html>
`;
let extraction_test_cases = [
  [
    example_com_html,
    "http://example.com",
    ["https://www.iana.org/domains/example"],
  ],
  [
    example_multiple_atags,
    "http://example.com",
    ["https://www.iana.org/domains/example", "https://www.google.com/"],
  ],
  [
    example_relative_atag,
    "http://example.com",
    ["http://example.com/xyz.html"],
  ],
];
// WARN: This test assumes that getURLsFromHTML returns atags in order, and assumes a specific format for the return. Arguably, equality should be tested using sets of normalized URLs instead.
for (let [htmlBody, baseURL, expected] of extraction_test_cases) {
  test(`Expecting URLs ${expected}`, () => {
    expect(getURLsFromHTML(htmlBody, baseURL)).toStrictEqual(expected);
  });
}
