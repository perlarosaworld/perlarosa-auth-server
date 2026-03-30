import express from 'express';
import fetch from 'node-fetch';

const app = express();
app.use(express.json());

const SHOP_DOMAIN = 'perlarosa-3.myshopify.com';
const CLIENT_ID = 'f8f29879-24e3-4557-a9a4-48f756d9ff20';

app.post('/auth/exchange', async (req, res) => {
  try {
    const { code, codeVerifier, redirectUri } = req.body;

    if (!code || !codeVerifier || !redirectUri) {
      return res.status(400).json({
        error: 'missing_params',
        error_description: 'code, codeVerifier and redirectUri are required',
      });
    }

    const discoveryResponse = await fetch(
      `https://${SHOP_DOMAIN}/.well-known/openid-configuration`
    );

    if (!discoveryResponse.ok) {
      const text = await discoveryResponse.text();
      return res.status(500).json({
        error: 'discovery_failed',
        error_description: text || 'Failed to load openid configuration',
      });
    }

    const config = await discoveryResponse.json();

    const tokenResponse = await fetch(config.token_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const data = await tokenResponse.json();
    return res.status(tokenResponse.status).json(data);
  } catch (error) {
    console.log('Exchange error:', error);
    return res.status(500).json({
      error: 'server_error',
      error_description: 'Token exchange failed',
    });
  }
});

app.get('/', (_req, res) => {
  res.send('perlarosa-auth-server is running');
});

app.listen(3000, () => {
  console.log('Auth server running on port 3000');
});
