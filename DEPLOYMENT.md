# 🚀 CartSeven Deployment Guide: Backend on Render + Frontend on Vercel

This guide outlines the step-by-step process for deploying CartSeven with:
- **Backend API**: Hosted on [Render.com](https://render.com) (Node.js / Express Web Service)
- **Frontend UI**: Hosted on [Vercel](https://vercel.com) (Vite + React SPA CDN)
- **Database**: Remote MongoDB Atlas Cluster (Already configured)

---

## 📦 Step 0: Push Code to GitHub

If you haven't pushed this repository to GitHub yet:

1. Create a new repository on [GitHub](https://github.com/new) named `cartseven` (private recommended).
2. In your terminal inside the `CartSeven` directory, run:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/cartseven.git
   git branch -M main
   git push -u origin main
   ```

---

## 🛠️ Step 1: Deploy Backend API on Render

1. Log in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `cartseven` repository.
4. Configure the service settings:
   - **Name**: `cartseven-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (or higher)

5. Under **Environment Variables**, add the following:

   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production mode |
   | `MONGO_URI` | `mongodb+srv://ajmalsha2001me_db_user:z6auE511CPs9ErAV@cluster0.ubiofdw.mongodb.net/cartseven?retryWrites=true&w=majority` | Your MongoDB Atlas connection |
   | `JWT_SECRET` | `cartseven_jwt_secret_key_super_secure_987654321_ecommerce` | Or your custom secret |
   | `JWT_EXPIRE` | `7d` | Session length |
   | `PUBLIC_REDIRECT_URL` | `https://cartseven.com/` | Public redirection for non-partners |
   | `PARTNER_1_NAME` | `AJMALSHA` | Partner 1 Name |
   | `PARTNER_1_EMAIL` | `ajmalsha@cartseven.com` | Partner 1 Email |
   | `PARTNER_1_PASSWORD` | `password123` | Partner 1 Password |
   | `PARTNER_1_ROLE` | `admin` | Managing Partner |
   | `PARTNER_2_NAME` | `ASHIQUE SALIM` | Partner 2 Name |
   | `PARTNER_2_EMAIL` | `ashique@cartseven.com` | Partner 2 Email |
   | `PARTNER_2_PASSWORD` | `password123` | Partner 2 Password |
   | `PARTNER_2_ROLE` | `accountant` | Finance Partner |
   | `PARTNER_3_NAME` | `SHANU` | Partner 3 Name |
   | `PARTNER_3_EMAIL` | `shanu@cartseven.com` | Partner 3 Email |
   | `PARTNER_3_PASSWORD` | `password123` | Partner 3 Password |
   | `PARTNER_3_ROLE` | `manager` | Operations Partner |

6. Click **Create Web Service**.
7. Once deployed, Render will provide your live backend URL:
   `https://cartseven-api.onrender.com`
   *(Verify by opening `https://cartseven-api.onrender.com/api/health` in your browser)*.

---

## ⚡ Step 2: Deploy Frontend on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New…** → **Project**.
3. Import your `cartseven` GitHub repository.
4. In the project configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `client`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)

5. Under **Environment Variables**, add:

   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://cartseven-api.onrender.com/api` *(replace with your Render URL from Step 1)* |
   | `VITE_PUBLIC_STORE_URL` | `https://cartseven.com/` |

6. Click **Deploy**.
7. In ~30 seconds, Vercel will assign your live production domain (e.g. `https://cartseven.vercel.app`).

---

## 🔄 Step 3: Link Vercel Domain Back to Render (Optional & Recommended)

Once Vercel gives you your frontend URL (e.g., `https://cartseven.vercel.app`):
1. Go back to your **Render Dashboard** → `cartseven-api` → **Environment**.
2. Add or update:
   - `CLIENT_URL`: `https://cartseven.vercel.app`
3. Click **Save Changes** (Render will automatically redeploy with the new allowed origin).

---

## 🔒 Verification Checklist

- [ ] Open the Vercel URL in an incognito window: You should see the **Restricted Partner Portal** redirecting public visitors to `https://cartseven.com/`.
- [ ] Click **"Authorized Partner? Sign In Here"**: Form opens without placeholders or clutter.
- [ ] Sign in with any of the 3 partner accounts from `.env`:
  - `ajmalsha@cartseven.com` / `password123`
  - `ashique@cartseven.com` / `password123`
  - `shanu@cartseven.com` / `password123`
- [ ] You should land on the Dashboard with full accounting functionality.
- [ ] Navigate to **Profile** or click your avatar: Access your **My Profile Settings** page without accidental logout.
