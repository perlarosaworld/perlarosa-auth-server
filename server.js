import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const SHOP_DOMAIN = 'perlarosa-3.myshopify.com';

app.post('/auth/exchange', async (req, res) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body;

    const discoveryResponse = await fetch(
      `https://${SHOP_DOMAIN}/.well-known/openid-configuration`
    );

    const config = await discoveryResponse.json();

    const tokenResponse = await fetch(config.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.client_id,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const data = await tokenResponse.json();
    res.json(data);
  } catch (error) {
    console.log('Exchange error:', error);
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

app.listen(3000, () => {
  console.log('Auth server running on port 3000');
});