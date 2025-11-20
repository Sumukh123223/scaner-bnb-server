# Scanner BNB Server

BNB Top-up Service for Scanner application. This server automatically sends BNB gas to user wallets.

## Features

- ✅ CORS enabled for all origins (no IP restrictions)
- ✅ Automatic BNB gas top-up (0.0002 BNB)
- ✅ Request logging for debugging
- ✅ Health check endpoint

## Railway Deployment

### Environment Variables

Set these in Railway dashboard → Settings → Variables:

1. **RPC_URL** - Your BSC RPC endpoint
   - Example: `https://bsc-dataseed.binance.org/`
   - Or use a custom RPC provider

2. **PRIVATE_KEY** - Your wallet private key (starts with `0x`)
   - ⚠️ **IMPORTANT**: Keep this secret! Never commit to Git.

3. **PORT** - Railway sets this automatically (usually 3000)

### Deployment Steps

1. Connect Railway to this GitHub repository
2. Railway will automatically detect `package.json` and deploy
3. Set the environment variables in Railway dashboard
4. The server will start automatically

### Testing

- Health check: `GET https://your-railway-url.railway.app/`
- Send BNB: `POST https://your-railway-url.railway.app/send-bnb`
  ```json
  {
    "recipient": "0xYourWalletAddress"
  }
  ```

## Local Development

```bash
# Install dependencies
npm install

# Create .env file
echo "RPC_URL=your_rpc_url" > .env
echo "PRIVATE_KEY=your_private_key" >> .env

# Start server
npm start
```

## API Endpoints

### GET `/`
Health check endpoint. Returns server status.

### POST `/send-bnb`
Sends 0.0002 BNB to the recipient address.

**Request:**
```json
{
  "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "0x...",
  "recipient": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "amount": "0.0002 BNB"
}
```

## Troubleshooting

### Deployment Failed
- Check Railway logs for error messages
- Verify all environment variables are set
- Ensure `package.json` is valid JSON (no merge conflicts)

### Server Not Starting
- Check if `RPC_URL` and `PRIVATE_KEY` are set
- Verify the RPC endpoint is accessible
- Check Railway logs for specific errors

### CORS Errors
- The server is configured to allow all origins
- If you still see CORS errors, check Railway network settings

## License

ISC

