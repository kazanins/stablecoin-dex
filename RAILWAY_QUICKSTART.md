# Railway Deployment - Quick Start

Deploy your Tempo DEX to Railway in 5 minutes!

## Step 1: Commit Your Code

```bash
git add .
git commit -m "Ready for Railway deployment"
git push
```

## Step 2: Deploy on Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway auto-detects Next.js and starts deploying!

## Step 3: Add Environment Variables

In Railway dashboard → **Variables** tab:

```
RPC_USERNAME=interesting-hodgkin
RPC_PASSWORD=jolly-elgamal
```

Click **"Add Variable"** after each one.

## Step 4: Wait for Deployment

⏱️ Takes ~2-3 minutes

Watch the logs in Railway dashboard to see progress.

## Step 5: Open Your App

Once deployed, click the **generated URL** (e.g., `https://your-app.up.railway.app`)

## ✅ Verify Deployment

- [ ] App loads
- [ ] Can sign up with passkey
- [ ] Can claim test tokens
- [ ] Orderbook displays
- [ ] Can place orders
- [ ] Bots start successfully

## 🔧 Troubleshooting

**Build failed?**
- Check Railway logs for errors
- Verify all dependencies are in `package.json`

**App loads but doesn't work?**
- Verify environment variables are set
- Check Railway logs for runtime errors
- Ensure RPC credentials are correct

**Bots won't start?**
- Bots need RPC credentials to access faucet
- Check logs for "Bot start error"

## 📚 Full Documentation

For detailed instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🆘 Need Help?

1. Check [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
2. Check [README.md](./README.md) - General app documentation
3. Railway docs: https://docs.railway.app
4. Tempo docs: https://docs.tempo.xyz

---

**Next Steps After Deployment:**
- Set up custom domain (optional)
- Monitor usage in Railway dashboard
- Check logs for any errors
- Share your deployed DEX! 🎉
