
const https = require('https');

const baseUrl = 'https://procurement-backend-1004043283503.asia-south1.run.app/api/procurement';

// Helper to make requests
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        }).on('error', reject);
    });
}

async function inspect() {
    console.log("1. Fetching recent RFQs...");
    // Fetch recent RFQs
    const rfqRes = await fetchUrl(`${baseUrl}/rfq?page=0&pageSize=5&sort=createdAt,desc`);

    if (rfqRes.status !== 200) {
        console.log("Failed to fetch RFQs: " + rfqRes.status);
        return;
    }

    const rfqData = JSON.parse(rfqRes.body);
    const validRfqs = rfqData.content || rfqData; // Access content if Page, or array if List

    console.log(`Found ${validRfqs.length} RFQs.`);

    for (const rfq of validRfqs) {
        console.log(`\n-----------------------------------`);
        console.log(`Checking RFQ ID: ${rfq.id} (${rfq.rfqNumber})`);
        console.log(`Status: ${rfq.status}`);
        console.log(`Invited Vendors: ${rfq.vendors.map(v => v.id).join(', ')}`);

        // Fetch Comparison
        const compRes = await fetchUrl(`${baseUrl}/rfq/${rfq.id}/comparison`);
        console.log(`Comparison API Status: ${compRes.status}`);

        if (compRes.status === 200) {
            const compData = JSON.parse(compRes.body);
            const vendorCount = compData.vendors ? compData.vendors.length : 0;
            console.log(`Quotation Count: ${vendorCount}`);
            if (vendorCount > 0) {
                console.log("Vendors with quotes: " + compData.vendors.map(v => v.vendorName).join(', '));
            } else {
                console.log("No quotations found for this RFQ.");
            }
        } else {
            console.log("Error fetching comparison.");
        }
    }
}

inspect();
