require('dotenv').config();

const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');

const app = express();

// EXPLICIT CORS configuration - Allow ALL origins and IPs
app.use(cors({
  origin: '*',  // Allow any origin
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: false,  // Set to false when using origin: '*'
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json());

// Add request logging to help diagnose IP issues
app.use((req, res, next) => {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} from IP: ${clientIP}`);
  console.log(`Origin: ${req.headers.origin || 'No origin header'}`);
  console.log(`User-Agent: ${req.headers['user-agent'] || 'Unknown'}`);
  next();
});

// Validate environment variables
if (!process.env.RPC_URL) {
  console.error('❌ ERROR: RPC_URL environment variable is not set!');
  process.exit(1);
}

if (!process.env.PRIVATE_KEY) {
  console.error('❌ ERROR: PRIVATE_KEY environment variable is not set!');
  process.exit(1);
}

const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'BNB Top-up Service',
    timestamp: new Date().toISOString(),
    walletAddress: wallet.address
  });
});

app.post('/send-bnb', async (req, res) => {
  const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  const { recipient } = req.body;

  console.log(`[${new Date().toISOString()}] BNB top-up request from IP: ${clientIP}`);
  console.log(`Recipient: ${recipient}`);

  if (!recipient) {
    console.error('Missing recipient address');
    return res.status(400).json({ error: "Recipient address is required" });
  }

  if (!ethers.utils.isAddress(recipient)) {
    console.error('Invalid recipient address:', recipient);
    return res.status(400).json({ error: "Invalid recipient address" });
  }

  try {
    console.log('Sending transaction...');
    const tx = await wallet.sendTransaction({
      to: recipient,
      value: ethers.utils.parseEther("0.0002"),
    });

    console.log(`Transaction sent: ${tx.hash}`);
    console.log('Waiting for confirmation...');
    
    await tx.wait();
    
    console.log(`Transaction confirmed: ${tx.hash}`);
    res.json({ 
      success: true, 
      txHash: tx.hash,
      recipient: recipient,
      amount: "0.0002 BNB"
    });
  } catch (err) {
    console.error("BNB send failed:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      stack: err.stack
    });
    res.status(500).json({ 
      error: "Transaction failed",
      message: err.message 
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Wallet address: ${wallet.address}`);
  console.log(`🌐 CORS enabled for all origins`);
  console.log(`✅ Ready to accept requests from any IP`);
});

