const express = require('express');
const dotenvx = require('@dotenvx/dotenvx');
const path = require('path');

// 1. Initialize environment security shield
dotenvx.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 2. Global Middleware Configuration
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded data

// 3. Mount System Architecture Routes
const vaultRoutes = require('./routes/vaultRoutes');
app.use('/api/vault', vaultRoutes); // Binds the IPFS pipeline to /api/vault endpoint

// 4. Base Health-Check Route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Zero-Trust SaaS Core Backend Engine is Live & Protected."
    });
});

// 5. Initialize Server Boot Listener
app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 CORE ENGINE ACTIVATED SUCCESSFULLY`);
    console.log(`📡 Network Listening Address: http://localhost:${PORT}`);
    console.log(`🛡️  Security State: Zero-Trust Protocols Ready`);
    console.log(`==================================================\n`);
});