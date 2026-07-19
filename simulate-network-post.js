const fs = require('fs');
const path = require('path');

async function triggerNetworkPost() {
    const filePath = path.join(__dirname, 'temp', 'secret-vault.txt');
    
    if (!fs.existsSync(filePath)) {
        console.error("❌ Test payload file missing in temp directory!");
        return;
    }

    console.log("📡 Initiating Simulated Form-Data Network Request to API Server...");

    // 1. Construct standard form-data standard standard structure in boundary strings
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);

    let data = '';
    data += `--${boundary}\r\n`;
    data += `Content-Disposition: form-data; name="payload"; filename="${fileName}"\r\n`;
    data += `Content-Type: text/plain\r\n\r\n`;

    const payloadBuffer = Buffer.concat([
        Buffer.from(data, 'utf-8'),
        fileBuffer,
        Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8')
    ]);

    try {
        // 2. Dispatch network stream directly to HTTP endpoint
        const response = await fetch('http://localhost:5000/api/vault/upload', {
            method: 'POST',
            headers: {
                'Content-Type': `multipart/form-data; boundary=${boundary}`
            },
            body: payloadBuffer
        });

        const jsonResponse = await response.json();
        
        console.log(`\n==================================================`);
        console.log(`🌐 HTTP STATUS: ${response.status} ${response.statusText}`);
        console.log(`==================================================`);
        console.log("📦 SERVER RESPONSE PAYLOAD:\n", JSON.stringify(jsonResponse, null, 2));
        console.log(`==================================================\n`);

    } catch (error) {
        console.error("🚨 HTTP Network Pipeline Crash:", error.message);
    }
}

triggerNetworkPost();