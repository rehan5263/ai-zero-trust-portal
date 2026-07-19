const { uploadToIPFS } = require('./services/ipfsService');
const path = require('path');

async function executeTest() {
    // 1. Path of the file we just created
    const targetFilePath = path.join(__dirname, 'temp', 'secret-vault.txt');
    
    console.log("🎬 Initiating Zero-Trust Storage Pipeline Launch...");
    
    // 2. Trigger the upload service
    const result = await uploadToIPFS(targetFilePath);
    
    // 3. Output results
    if (result.success) {
        console.log("\n🔥 [UPLOAD SUCCESSFUL]");
        console.log(`📄 File Name: ${result.fileName}`);
        console.log(`🔑 Cryptographic CID: ${result.cid}`);
        console.log(`🌐 Secure IPFS Gateway Link: ${result.ipfsUrl}`);
        console.log("\n💡 Note: Copy this Gateway Link and paste it in your browser to see your live file content!");
    } else {
        console.log("\n❌ [UPLOAD FAILED]");
        console.log(`Reason: ${result.error}`);
    }
}

executeTest();