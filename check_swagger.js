
const https = require('https');

const url = 'https://procurement-backend-1004043283503.asia-south1.run.app/v3/api-docs';

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Is JSON: ${data.startsWith('{')}`);
        console.log(`Preview: ${data.substring(0, 50)}...`);
    });
}).on("error", (err) => {
    console.log("Error: " + err.message);
});
