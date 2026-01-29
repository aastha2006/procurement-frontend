
const https = require('https');

// The new RFQ ID seen in your logs is 12
const url = 'https://procurement-backend-1004043283503.asia-south1.run.app/api/procurement/rfq/12/comparison';

console.log("Fetching Comparison for RFQ 12...");

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log("Status: " + res.statusCode);
        console.log("Body: " + data);
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
