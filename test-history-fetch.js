const http = require('http');

console.log("📡 Requesting Cryptographic Audit Logs from Cloud History Endpoint...");

// /api/vault/history endpoint par hit karne ke liye configurations
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/vault/history',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log("\n==================================================");
        console.log(`🌐 HTTP STATUS: ${res.statusCode} ${res.statusMessage}`);
        console.log("==================================================");
        console.log("📦 RETRIEVED HISTORY PAYLOAD FROM AWS:");
        
        try {
            const parsedData = JSON.parse(data);
            console.log(JSON.stringify(parsedData, null, 2));
        } catch (e) {
            console.log(data);
        }
        console.log("==================================================\n");
    });
});

req.on('error', (error) => {
    console.error(`🚨 Connection Failed: ${error.message}`);
});

// Request finish karo
req.end();