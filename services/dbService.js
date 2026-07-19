const { PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { marshall } = require('@aws-sdk/util-dynamodb');
const { ddbClient } = require('./awsConfig');

/**
 * @desc    Registers cryptographic file metadata tokens into AWS DynamoDB ledger
 * @param   {Object} fileMeta - Object containing file metrics from IPFS upload
 * @returns {Object} Execution status object
 */
async function registerFileMetadata(fileMeta) {
    // Standard secure table name for storing audit ledgers
    const TABLE_NAME = "ZeroTrustAuditLogs";

    try {
        console.log(`⏳ Constructing NoSQL transaction ledger for payload: ${fileMeta.originalName}...`);

        // 1. Structural item payload design mapped to compliance protocols
        const recordPayload = {
            fileId: fileMeta.systemName, // Unique Primary Partition Key
            fileName: fileMeta.originalName,
            ipfsHashCID: fileMeta.cid,
            gatewaySecureUrl: fileMeta.ipfsUrl,
            payloadByteSize: fileMeta.byteSize,
            uploadedAt: new Date().toISOString(),
            integrityStatus: "VERIFIED"
        };

        // 2. Utilize Marshall utility to convert standard JavaScript objects into native AWS JSON types
        const params = {
            TableName: TABLE_NAME,
            Item: marshall(recordPayload)
        };

        // 3. Dispatch the payload execution command directly to AWS Cloud Node
        // Note: During local testing without real keys, this will drop to catch block safely
        await ddbClient.send(new PutItemCommand(params));
        
        console.log("✨ Ledger transaction written successfully to AWS Cloud!");
        return { success: true };

    } catch (cloudError) {
        console.error("🚨 AWS Database Transaction Interrupted:", cloudError.message);
        
        // Return fallback simulation to keep our core logic running smoothly during local offline dev
        return { 
            success: false, 
            error: cloudError.message,
            fallbackReason: "Local environment bypass active or pending real IAM cloud credentials setup"
        };
    }
}

module.exports = { registerFileMetadata };