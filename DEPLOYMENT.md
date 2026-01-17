# Deploying to Railway

This guide will help you deploy the Tempo DEX Demo to Railway.

## Prerequisites

- A [Railway](https://railway.app) account
- The Tempo RPC Basic Auth credentials (username and password)

## Deployment Steps

### 1. Prepare Your Repository

Make sure all your code is committed to a Git repository (GitHub, GitLab, or Bitbucket).

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push
```

### 2. Create New Project on Railway

1. Go to [Railway](https://railway.app) and log in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will auto-detect it's a Next.js app

### 3. Configure Environment Variables

In the Railway project dashboard:

1. Go to **"Variables"** tab
2. Add the following environment variables:

```
RPC_USERNAME=interesting-hodgkin
RPC_PASSWORD=jolly-elgamal
```

**Optional Bot Configuration** (for persistent bot identities):
```
BOT1_PRIVATE_KEY=0x... (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
BOT2_PRIVATE_KEY=0x...
BOT3_PRIVATE_KEY=0x...
```

> **Note**: If bot private keys are not provided, the app will generate new ones on each deployment. This is fine for demo purposes.

### 4. Deploy

Railway will automatically:
- Run `npm install`
- Run `npm run build`
- Run `npm run start`

The deployment should complete in 2-3 minutes.

### 5. Access Your App

Once deployed, Railway will provide a URL like:
```
https://your-app-name.up.railway.app
```

Click the URL to open your deployed Tempo DEX!

## Troubleshooting

### Build Failures

If the build fails, check:
- All dependencies are listed in `package.json`
- Environment variables are set correctly
- Check Railway logs for specific error messages

### Runtime Errors

If the app deploys but doesn't work:
- Verify RPC credentials are correct
- Check Railway logs: **Deployments** → Select deployment → **View Logs**
- Ensure the Tempo Moderato RPC endpoint is accessible

### Bot Issues

If bots don't start:
- Bots require RPC credentials to fund addresses via faucet
- Check logs for "Bot start error" messages
- Bots auto-generate keys if not provided in env vars

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `RPC_USERNAME` | Yes | Tempo RPC Basic Auth username |
| `RPC_PASSWORD` | Yes | Tempo RPC Basic Auth password |
| `BOT1_PRIVATE_KEY` | No | Private key for bot 1 (auto-generated if omitted) |
| `BOT2_PRIVATE_KEY` | No | Private key for bot 2 (auto-generated if omitted) |
| `BOT3_PRIVATE_KEY` | No | Private key for bot 3 (auto-generated if omitted) |
| `NODE_ENV` | No | Auto-set to `production` by Railway |

## Post-Deployment Checklist

- [ ] App loads successfully
- [ ] Can create account with passkey
- [ ] Can claim test tokens from faucet
- [ ] Orderbook displays real data
- [ ] Can place orders (limit, flip, market)
- [ ] Bots start and place liquidity orders
- [ ] Confetti animation works on order placement
- [ ] Activity log shows transactions

## Performance Notes

- **Cold starts**: First request after inactivity may be slow (~2-3 seconds)
- **RPC rate limiting**: Sequential bot orders prevent 429 errors
- **Orderbook queries**: Scans 80 ticks (±200), takes ~300-500ms

## Updating the Deployment

To deploy updates:

```bash
git add .
git commit -m "Your update message"
git push
```

Railway will automatically detect the push and redeploy.

## Custom Domain (Optional)

To use a custom domain:

1. Go to **Settings** → **Domains**
2. Click **"Generate Domain"** for a railway.app subdomain
3. Or click **"Custom Domain"** to add your own domain
4. Follow Railway's instructions to configure DNS

## Support

- Railway docs: https://docs.railway.app
- Tempo docs: https://docs.tempo.xyz
- This repo: Check the README.md for app-specific documentation
