require('dotenv').config();
const { PinataSDK } = require("pinata-web3");
const fs = require('fs');
const path = require('path');

// Safe Gateway Format Configuration
const gatewayUrl = process.env.PINATA_GATEWAY.startsWith('http') 
    ? process.env.PINATA_GATEWAY 
    : `https://${process.env.PINATA_GATEWAY}`;

// Initialize IPFS Client
const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT,
    pinataGateway: gatewayUrl.replace('https://', '')
});

/**
 * Uploads a local file securely to the IPFS Network
 * @param {string} localFilePath - The absolute or relative path to the local file
 * @returns {Object} Metadata including the unique IPFS CID
 */
async function uploadToIPFS(localFilePath) {
    try {
        // 1. Verify if file exists locally
        if (!fs.existsSync(localFilePath)) {
            throw new Error(`File not found at path: ${localFilePath}`);
        }

        console.log(`⏳ Processing storage payload: ${path.basename(localFilePath)}...`);

        // 2. Read file binary data and construct standard File object
        const fileBuffer = fs.readFileSync(localFilePath);
        const blob = new Blob([fileBuffer]);
        const fileObject = new File([blob], path.basename(localFilePath), { type: "application/octet-stream" });

        // 3. Dispatch secure upload request to IPFS Hub
        const uploadResponse = await pinata.upload.file(fileObject);

        // console.log("🔍 RAW PINATA RESPONSE:", uploadResponse);

        console.log("✨ IPFS Stream Injection Complete!");
        
        return {
            success: true,
            fileName: path.basename(localFilePath),
            cid: uploadResponse.IpfsHash, // Changed from .cid to .IpfsHash
            size: uploadResponse.PinSize,  // Changed from .size to .PinSize
            ipfsUrl: `${gatewayUrl}/ipfs/${uploadResponse.IpfsHash}`
        };

    } catch (error) {
        console.error("❌ IPFS Upload Pipeline Failed:", error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = { uploadToIPFS };