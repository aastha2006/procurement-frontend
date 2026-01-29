
const https = require('https');

const urls = [
    'https://procurement-backend-qwtuy6sfhq-el.a.run.app/api/procurement/version',
    'https://procurement-backend-1004043283503.asia-south1.run.app/api/procurement/version'
];

urls.forEach(url => {
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`\n[${res.statusCode}] URL: ${url}`);
            console.log(`Response: ${data.trim()}`);
        });
    }).on("error", (err) => {
        console.log(`\n[ERROR] URL: ${url}`);
        console.log(`Message: ${err.message}`);
    });
});
