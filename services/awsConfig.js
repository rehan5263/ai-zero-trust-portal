const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

// 1. Assert system safety checks before initializing cloud connection
if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.warn("⚠️ AWS Security Warning: Cloud credentials missing in environment layer!");
}

// 2. Initialize the isolated, secure connection pipeline to AWS Mumbai Region
const ddbClient = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-south-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    // 🔥 ENFORCE TIMEOUTS TO PREVENT BLINKING STUCK CURSOR
    requestHandler: {
        connectionTimeout: 5000, // 5 seconds max to establish connection
        socketTimeout: 5000     // 5 seconds max to wait for data packets
    }
});

console.log("🛡️  AWS DynamoDB Infrastructure Tunnel Configured.");

module.exports = { ddbClient };