# Google Maps API Setup Guide

This guide will help you set up Google Maps API for your property listing platform.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click "New Project"
4. Enter a project name (e.g., "PropTech Platform")
5. Click "Create"

## Step 2: Enable Required APIs

You need to enable the following APIs for your project:

1. Go to [APIs & Services > Library](https://console.cloud.google.com/apis/library)
2. Search for and enable each of these APIs:
   - **Maps JavaScript API** (for displaying maps)
   - **Places API** (for address autocomplete)
   - **Geocoding API** (for converting addresses to coordinates)

To enable each API:
- Click on the API name
- Click the "Enable" button
- Wait for it to activate

## Step 3: Create API Credentials

1. Go to [APIs & Services > Credentials](https://console.cloud.google.com/apis/credentials)
2. Click "Create Credentials" at the top
3. Select "API Key"
4. Your API key will be created and displayed

## Step 4: Secure Your API Key (IMPORTANT!)

For security, you should restrict your API key:

1. In the API key details, click "Edit API key"
2. Under "Application restrictions":
   - Select "HTTP referrers (web sites)"
   - Add your domains:
     - `localhost:5173/*` (for local development)
     - `yourdomain.com/*` (for production)
3. Under "API restrictions":
   - Select "Restrict key"
   - Choose only the APIs you enabled:
     - Maps JavaScript API
     - Places API
     - Geocoding API
4. Click "Save"

## Step 5: Add API Key to Your Project

1. Open the `.env` file in your project root
2. Replace `your_google_maps_api_key_here` with your actual API key:

```
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...your_actual_key_here
```

3. Save the file
4. Restart your development server

## Step 6: Test the Integration

After setting up your API key:

1. Start your development server (`npm run dev`)
2. Navigate to the "Publish Property" page
3. Go to Step 2 (Location)
4. You should see:
   - An interactive Google Map
   - Address search autocomplete
   - Draggable marker for precise location selection
5. Try searching for an address in Argentina
6. Try dragging the marker to adjust the location

## Features Included

Your Google Maps integration includes:

### Property Form (Publish/Edit)
- **Address Autocomplete**: Search and select addresses with Google Places
- **Interactive Map**: Drag the marker to adjust location precisely
- **Reverse Geocoding**: Automatically fills city, neighborhood, and province when you move the marker
- **Current Location**: Button to use your device's GPS location
- **Argentina-focused**: Search is restricted to Argentina for better results

### Property Detail Page
- **Interactive Map View**: Users can explore the area, zoom, and pan
- **Street View**: Toggle to see 360° street-level imagery
- **Directions**: "Cómo llegar" button opens Google Maps for navigation
- **Fullscreen Mode**: Expand the map for better viewing
- **POI Display**: Shows nearby points of interest

## Pricing Information

Google Maps Platform offers a free tier with:
- $200 monthly credit (enough for ~28,000 map loads or ~40,000 geocoding requests)
- Pay-as-you-go after the free credit

For typical PropTech usage, the free tier should be sufficient for development and small-scale production.

## Troubleshooting

### Map not showing
- Check that your API key is correctly set in `.env`
- Verify all three APIs are enabled in Google Cloud Console
- Check browser console for error messages
- Restart your development server after adding the API key

### "This page can't load Google Maps correctly"
- Your API key might not be properly restricted
- Check that you've enabled billing in Google Cloud (even with free tier)
- Verify HTTP referrer restrictions include your domain

### Geocoding not working
- Ensure the Geocoding API is enabled
- Check your API key restrictions include Geocoding API
- Verify you haven't exceeded the free tier quota

### Address search not working
- Ensure the Places API is enabled
- Check API key restrictions include Places API
- Verify internet connection

## Support

For more information:
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [Support](https://developers.google.com/maps/support)

## Security Best Practices

1. **Never commit your API key to version control**
   - The `.env` file is already in `.gitignore`
   - Use environment variables in production

2. **Always restrict your API key**
   - Set HTTP referrer restrictions
   - Limit to only the APIs you use
   - Monitor usage in Google Cloud Console

3. **Monitor your usage**
   - Set up billing alerts in Google Cloud Console
   - Check the Quotas page regularly
   - Review API usage reports monthly

4. **Rotate keys periodically**
   - Create a new key every few months
   - Delete old unused keys
   - Update all environments when rotating
