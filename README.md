# Nexus Gaming

Premium gaming electronics storefront demo built with vanilla HTML, CSS, and JavaScript.

## Highlights

- **Admin dashboard** — Manage buy requests/orders (username: `admin`, password: `nexus123`). Access via [admin.html](admin.html) or footer link.
- 12-product catalog with category filters
- Live search overlay and quick product preview modal
- Sort controls (featured, price, name)
- Cart with quantity management and localStorage persistence
- Checkout flow and order confirmation modal
- Trust metrics + testimonial sections
- Responsive layout for desktop, tablet, and mobile

## Project Structure

- `index.html` - Page layout and sections
- `styles.css` - Styling, responsive behavior, and motion
- `script.js` - Product rendering, cart, search, checkout, and UI state
- `vercel.json` - Vercel routing and basic security headers

## Run Locally

Open `index.html` directly, or run a static server:

```bash
npx serve .
```

## Push to GitHub

```bash
git init
git add .
git commit -m "feat: complete GamingNexus storefront with full UX"
git branch -M main
git remote add origin https://github.com/JihedMedini/gamingNexus.git
git push -u origin main
```

## Deploy to GitHub Pages

1. Go to **Settings → Pages** in your repo.
2. Under "Build and deployment", set **Source** to **GitHub Actions**.
3. Push to `main` — the workflow will deploy to `https://jihedmedini.github.io/gamingNexus/`.

## Deploy to Vercel

### Option 1: Dashboard (recommended)

1. Open [Vercel](https://vercel.com) and click **Add New Project**.
2. Import `JihedMedini/gamingNexus`.
3. Framework preset: **Other**.
4. Build command: leave empty.
5. Output directory: leave empty (root static site).
6. Click **Deploy**.

### Option 2: Vercel CLI

```bash
npm i -g vercel
vercel
vercel --prod
```

The included `vercel.json` ensures clean URLs and SPA-style rewrites to `index.html`.
