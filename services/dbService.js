const { PutItemCommand, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb');
const { ddbClient } = require('./awsConfig');

// Standard secure table name for storing audit ledgers
const TABLE_NAME = "ZeroTrustAuditLogs";

/**
 * @desc    Registers cryptographic file metadata tokens into AWS DynamoDB ledger
 * @param   {Object} fileMeta - Object containing file metrics from IPFS upload
 * @returns {Object} Execution status object
 */
async function registerFileMetadata(fileMeta) {
    try {
        console.log(`⏳ Constructing NoSQL transaction ledger for payload: ${fileMeta.originalName}...`);

        const recordPayload = {
            fileId: fileMeta.cid, 
            fileName: fileMeta.originalName,
            ipfsHashCID: fileMeta.cid,
            gatewaySecureUrl: fileMeta.ipfsUrl,
            payloadByteSize: fileMeta.byteSize,
            uploadedAt: new Date().toISOString(),
            integrityStatus: "VERIFIED"
        };

        const params = {
            TableName: TABLE_NAME,
            Item: marshall(recordPayload)
        };

        console.log("🚀 Attempting live cloud connection to AWS DynamoDB...");
        await ddbClient.send(new PutItemCommand(params));
        
        console.log("✨ Ledger transaction written successfully to AWS Cloud!");
        return { success: true };

    } catch (cloudError) {
        console.log("\n==================================================");
        console.error("🚨 REAL AWS LEDGER ERROR IDENTIFIED:");
        console.error(`👉 Message: ${cloudError.message}`);
        console.log("==================================================\n");
        
        return { success: false, error: cloudError.message };
    }
}

/**
 * @desc    Fetches all historical audit logs from AWS DynamoDB for the history dashboard
 * @returns {Object} Execution status and array of log items
 */
async function getAllAuditLogs() {
    try {
        console.log("⏳ Fetching all historical logs from AWS DynamoDB...");

        const params = {
            TableName: TABLE_NAME
        };

        // Scan command pure table ka data extract karta hai
        const data = await ddbClient.send(new ScanCommand(params));

        // AWS JSON format ko wapas normal JavaScript array of objects mein convert karna
        const unmarshalledItems = data.Items.map(item => unmarshall(item));

        console.log(`✨ Successfully retrieved ${unmarshalledItems.length} log records from Cloud History!`);
        
        return {
            success: true,
            logs: unmarshalledItems
        };

    } catch (cloudError) {
        console.error("🚨 AWS History Retrieval Failed:", cloudError.message);
        return {
            success: false,
            error: cloudError.message,
            logs: []
        };
    }
}

// Dono functions ko export kar rahe hain taaki routes mein use ho sakein
module.exports = { registerFileMetadata, getAllAuditLogs };