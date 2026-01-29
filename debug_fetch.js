
const https = require('https');

const url = 'https://procurement-backend-1004043283503.asia-south1.run.app/api/procurement/rfq?page=0&pageSize=1&sort=createdAt,desc';

console.log("Fetching: " + url);
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
