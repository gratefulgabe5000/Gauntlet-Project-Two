# Giphy API Setup Instructions

The GIF feature requires a Giphy API key. The demo key is often banned or rate-limited.

## Get a Free API Key

1. Go to https://developers.giphy.com/
2. Click "Create an App"
3. Choose "API" (not SDK)
4. Fill out the form:
   - **App Name**: MessageAI
   - **App Description**: A messaging app with GIF support
   - **Select SDK or API**: Choose **API**
5. Click "Create App"
6. Copy your API Key

## Add API Key to Your App

### Option 1: Using app.json (Recommended)

Add the following to your `app.json` under the `expo` object:

```json
{
  "expo": {
    ...existing config...,
    "extra": {
      "giphyApiKey": "YOUR_API_KEY_HERE"
    }
  }
}
```

### Option 2: Using environment variables

If you're using `expo-constants`:

1. Install if not already installed:
   ```bash
   npx expo install expo-constants
   ```

2. Add to `app.json`:
   ```json
   {
     "expo": {
       ...existing config...,
       "extra": {
         "giphyApiKey": process.env.GIPHY_API_KEY
       }
     }
   }
   ```

3. Set environment variable before running:
   ```bash
   # Windows PowerShell
   $env:GIPHY_API_KEY="your_key_here"; npx expo start
   
   # Mac/Linux
   GIPHY_API_KEY=your_key_here npx expo start
   ```

## After Adding the Key

1. Stop your Expo server (Ctrl+C)
2. Clear cache and restart:
   ```bash
   npx expo start --clear
   ```
3. Reload the app on your device
4. The GIF picker should now work!

## Rate Limits

- **Free Tier**: 42 requests per hour per IP (demo key)
- **SDK Key**: 1000 requests per day
- **Production Key**: Contact Giphy for higher limits

## Troubleshooting

- **"BANNED" error**: Demo key is blocked, get your own key
- **Rate limit errors**: Wait an hour or get a production key
- **No GIFs showing**: Check console logs for API errors

