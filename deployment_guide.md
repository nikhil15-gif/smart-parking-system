# 🚀 SmartPark Deployment Guide

Follow these steps to deploy your Smart Parking System to **Render.com**.

## 1. Prepare GitHub
I have already updated your code and pushed it to GitHub. Ensure your repository is up to date:
- **URL**: `https://github.com/nikhil15-gif/smart-parking-system`
- **Branch**: `main`

## 2. Create Web Service on Render
1. Log in to [Render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository.

## 3. Configuration Settings
In the "Create Web Service" screen, set the following:

| Setting | Value |
| :--- | :--- |
| **Name** | `smart-parking-system` |
| **Language** | `Node` |
| **Root Directory** | *(Leave this EMPTY)* |
| **Build Command** | `npm run install-all && npm run build` |
| **Start Command** | `npm start` |

## 4. Environment Variables
Click **Advanced** -> **Add Environment Variable** and add these keys:

| Key | Value |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | *Paste your MongoDB Atlas connection string* |
| `JWT_SECRET` | *Any long random string (e.g. `smartpark_2026_secure`)* |
| `VITE_MAPBOX_TOKEN` | *Paste your Mapbox access token* |

## 5. Launch 🚀
1. Click **Create Web Service**.
2. Wait for the build to finish.
3. Once the status turns green (**Live**), click the URL at the top (e.g., `https://smart-parking.onrender.com`).

---

## 🛠️ Troubleshooting

### "Missing script: build"
- **Cause**: Render is likely looking in the `server` or `client` folder instead of the main folder.
- **Fix**: Go to **Settings** -> **Root Directory** and make sure it is completely **BLANK**.

### "MongoDB Connection Error"
- **Cause**: You forgot to add the `MONGODB_URI` environment variable.
- **Fix**: Go to the **Environment** tab on Render and ensure the key is named correctly and the value is your database link.

### "Map is blank"
- **Cause**: Missing Mapbox token.
- **Fix**: Ensure `VITE_MAPBOX_TOKEN` is set in the **Environment** tab.
