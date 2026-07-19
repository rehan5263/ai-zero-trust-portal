require('dotenv').config();
const { PinataSDK } = require("pinata-web3");

// Check configuration parameters
if (!process.env.PINATA_JWT || !process.env.PINATA_GATEWAY) {
    console.error("❌ Error: .env file mein JWT ya Gateway missing hai!");
    process.exit(1);
}

// Format the gateway URL properly for the SDK
const gatewayUrl = process.env.PINATA_GATEWAY.startsWith('http') 
    ? process.env.PINATA_GATEWAY 
    : `https://${process.env.PINATA_GATEWAY}`;

console.log("⏳ Connecting to Pinata Cloud Network...");

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: gatewayUrl.replace('https://', '')
});

async function runTest() {
    try {
        // Authenticate connection with Pinata server
        const auth = await pinata.testAuthentication();
        console.log("✨ STATUS: SUCCESS! Connection Established.");
        console.log("🚀 Message:", auth.message);
        console.log("🔒 Your Zero-Trust Storage Hub is 100% Online!");
    } catch (error) {
        console.error("❌ STATUS: FAILED! Authentication Error.");
        console.error("Reason:", error.message);
        console.log("\n💡 Debug Tip: Apni .env file mein check karo ki JWT ke aage koi extra space ya comma toh nahi reh gaya.");
    }
}

runTest();