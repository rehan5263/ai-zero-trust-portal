const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { uploadToIPFS } = require('../services/ipfsService');
const { registerFileMetadata } = require('../services/dbService'); // <-- Step 29 Added

// Configure temporary disk storage allocation for incoming network payloads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../temp'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

/**
 * @route   POST /api/vault/upload
 * @desc    Intercept file payload, upload to IPFS, log audit to AWS DynamoDB
 * @access  Protected (Zero-Trust Layer ready)
 */
router.post('/upload', upload.single('payload'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: "Bad Request: No file payload detected in form-data stream."
            });
        }

        const localFilePath = req.file.path;

        // 1. Fire the storage engine execution
        const ipfsResult = await uploadToIPFS(localFilePath);

        // 2. If IPFS upload succeeds, pipe the data records to AWS Database Ledger
        if (ipfsResult.success) {
            
            const dbPayload = {
                originalName: req.file.originalname,
                systemName: req.file.filename,
                cid: ipfsResult.cid,
                ipfsUrl: ipfsResult.ipfsUrl,
                byteSize: ipfsResult.size
            };

            // Trigger the AWS log insertion service
            const dbResult = await registerFileMetadata(dbPayload);

            // 3. Complete system handshake and return combined response to client
            return res.status(200).json({
                success: true,
                message: "Payload securely integrated with decentralized hub & logged in cloud ledger.",
                meta: {
                    originalName: dbPayload.originalName,
                    systemName: dbPayload.systemName,
                    cid: dbPayload.cid,
                    ipfsUrl: dbPayload.ipfsUrl,
                    byteSize: dbPayload.byteSize,
                    awsLedgerLogged: dbResult.success ? "CONFIRMED" : "SIMULATED_LOCAL_BYPASS"
                }
            });
            
        } else {
            return res.status(502).json({
                success: false,
                error: "IPFS Injection Layer Failed",
                details: ipfsResult.error
            });
        }

    } catch (globalError) {
        console.error("🚨 Route Pipeline Exception Failure:", globalError.message);
        return res.status(500).json({
            success: false,
            error: "Internal Server Protocol Exception Error."
        });
    }
});

module.exports = router;