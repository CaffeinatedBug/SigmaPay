# SigmaPay

> Non-custodial payment gateway for the Ergo Blockchain

SigmaPay allows merchants to verify cryptocurrency payments without handling or custodying any funds. The backend acts as a trusted verifier, checking on-chain data to confirm that customers have made valid payments.

## Features

- **Non-custodial**: Never handles or stores cryptocurrency
- **Trustless verification**: Verifies payments directly on the Ergo blockchain
- **Simple API**: Single endpoint for payment verification
- **Configurable**: Adjustable confirmation requirements
- **Type-safe**: Written in TypeScript with full type definitions

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env  # or just use the provided .env

# Run in development mode
npm run dev

# Or build and run in production
npm run build
npm start
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `ERGO_EXPLORER_API_URL` | Ergo Explorer API endpoint | `https://api.ergoplatform.com/api/v1` |
| `MIN_CONFIRMATIONS` | Minimum confirmations required | `1` |
| `CORS_ORIGINS` | Allowed CORS origins | `*` |

## API Documentation

### Verify Payment

Verifies that a payment was made to a merchant's address.

**Endpoint:** `POST /api/payments/verify`

**Request Body:**
```json
{
  "txId": "abc123...def456",
  "merchantAddress": "9f4QF8AD1nQ3nJahQVkM...",
  "expectedAmountErg": 1.5
}
```

| Field | Type | Description |
|-------|------|-------------|
| `txId` | string | 64-character transaction ID |
| `merchantAddress` | string | Ergo address starting with "9" (mainnet) |
| `expectedAmountErg` | number | Expected payment amount in ERG |

**Success Response (200):**
```json
{
  "verified": true,
  "txId": "abc123...def456",
  "confirmations": 3,
  "receivedAmount": "1.500000000",
  "message": "Payment verified successfully"
}
```

**Error Responses:**

| Status | Code | Description |
|--------|------|-------------|
| 400 | `INVALID_REQUEST` | Missing or invalid request parameters |
| 400 | `INVALID_ADDRESS` | Invalid Ergo address format |
| 400 | `INSUFFICIENT_CONFIRMATIONS` | Transaction not confirmed enough |
| 400 | `WRONG_RECIPIENT` | No payment to merchant address found |
| 400 | `AMOUNT_TOO_LOW` | Payment amount less than expected |
| 404 | `TX_NOT_FOUND` | Transaction not found on blockchain |
| 503 | `API_UNAVAILABLE` | Ergo Explorer API unavailable |

### Health Check

**Endpoint:** `GET /api/payments/health`

**Response:**
```json
{
  "status": "healthy",
  "service": "SigmaPay Payment Verification",
  "minConfirmations": 1,
  "timestamp": "2024-01-15T12:00:00.000Z"
}
```

## Integration Example

### JavaScript/TypeScript Frontend

```typescript
async function verifyPayment(txId: string): Promise<boolean> {
  const response = await fetch('http://localhost:3000/api/payments/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      txId: txId,
      merchantAddress: '9f4QF8AD1nQ3nJahQVkMHYzKKX...',
      expectedAmountErg: 10.0,
    }),
  });

  const data = await response.json();
  
  if (data.verified) {
    console.log(`Payment verified! Received ${data.receivedAmount} ERG`);
    return true;
  } else {
    console.error(`Verification failed: ${data.error.message}`);
    return false;
  }
}
```

## Understanding Ergo Payments

### For EVM Developers

If you're coming from Ethereum development, here are the key differences:

| Concept | Ethereum | Ergo |
|---------|----------|------|
| Model | Account-based | UTXO-based |
| Smallest unit | Wei (10^-18 ETH) | NanoErg (10^-9 ERG) |
| Transaction to field | Single `to` address | Multiple outputs |
| Payment verification | Check `tx.to` and `tx.value` | Loop through `tx.outputs` |
| Address format | Hex starting with `0x` | Base58 starting with `9` |

### How Verification Works

1. **Fetch Transaction**: Get transaction data from Ergo Explorer API
2. **Check Confirmations**: Ensure transaction has enough block confirmations
3. **Find Output**: Loop through outputs to find one matching the merchant address
4. **Verify Amount**: Confirm the output value meets or exceeds expected payment

```
Transaction Structure:
┌─────────────────────────────────────────────┐
│ Inputs (UTXOs being spent)                   │
│  └─ Box: 10 ERG from sender                 │
├─────────────────────────────────────────────┤
│ Outputs (New UTXOs created)                  │
│  ├─ Box: 2 ERG → Merchant ✓ (Payment)       │
│  ├─ Box: 7.998 ERG → Sender (Change)        │
│  └─ Box: 0.002 ERG → Miner (Fee)            │
└─────────────────────────────────────────────┘
```

## Project Structure

```
sigmapay/
├── src/
│   ├── server.ts              # Express app entry point
│   ├── controllers/
│   │   └── paymentController.ts  # Verification logic
│   ├── services/
│   │   └── ergoService.ts     # Ergo Explorer API client
│   ├── routes/
│   │   └── paymentRoutes.ts   # API route definitions
│   ├── middleware/
│   │   └── errorHandler.ts    # Error handling middleware
│   └── types/
│       └── ergo.types.ts      # TypeScript interfaces
├── .env                       # Environment configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run compiled production build |
| `npm run clean` | Remove build artifacts |

## License

MIT
