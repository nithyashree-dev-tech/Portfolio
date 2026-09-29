# M Nithya Shree Portfolio

A full-stack portfolio website for an AI & Data Science engineering student focusing on cloud, Linux, networking, cybersecurity, and data analytics.

## Stack

- Frontend: React, Vite, TypeScript, custom responsive CSS, React Router, Framer Motion, Lucide React
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT
- Dev tools: Git, GitHub, Postman, ESLint, Prettier

## Features

- Responsive portfolio pages and smooth navigation
- Project and certification detail pages
- Contact form with validation and backend storage
- Admin authentication and dashboard for content management
- MongoDB-backed API and seed data
- Dark/light theme and motion-aware accessibility

## Local setup

1. Copy `.env.example` to `.env` and update values if needed.
   - Set a strong `JWT_SECRET`.
   - Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the initial admin account. The password is hashed before MongoDB storage.
2. Install dependencies from the project root:
   - `npm install`
   - `npm install --prefix client`
   - `npm install --prefix server`
3. Start the full stack from the project root:
   - `npm run dev`
4. Frontend runs at `http://localhost:5173`
5. Backend runs at `http://localhost:5000`

The API requires `MONGODB_URI` and will not connect to local MongoDB or start with in-memory fallback data. For local development, configure the same MongoDB Atlas connection string used by your deployed API.

## Deploy to Vercel

The Vercel configuration in `vercel.json` builds and serves the Vite frontend, including client-side routes such as `/projects` and `/resume`. The Express API should run as a Node service, and MongoDB Atlas stores portfolio records and resume PDFs. Resume PDFs use MongoDB GridFS, so they do not need a separate persistent disk.

1. Push this repository to GitHub and import it into Vercel. Keep the project root set to the repository root; `vercel.json` supplies the client install, build, and output settings.
2. Deploy the API from the `server` directory as a Node web service on Render. Use `npm install` as the build command and `npm start` as the start command.
3. Set `MONGODB_URI` to your Atlas connection string and `MONGODB_DATABASE` to the exact name of your existing portfolio database. Percent-encode special characters in the database password. Create a MongoDB user with `readWrite` access to that database and allow the API host to connect in Atlas Network Access.
4. Add these environment variables to Render:
   - `NODE_ENV=production`
   - `MONGODB_URI` set to the Atlas connection string
   - `JWT_SECRET` set to a newly generated, long random secret
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` set to your chosen admin credentials
   - `CLIENT_URL` set to your exact Vercel production origin, such as `https://your-portfolio.vercel.app` (multiple origins can be comma-separated)
5. Add `VITE_API_BASE_URL` to the Vercel project's Production environment variables. Set it to the full Render API base URL, for example `https://your-api.onrender.com/api/v1`, then redeploy the Vercel project so Vite embeds it in the frontend.
6. Open `/api/v1/health` on the Render service to confirm it is running, then test the Vercel portfolio, contact form, admin login, and resume downloads.

The app creates its MongoDB collections automatically on first writes: `admins`, `projects`, `certifications`, `skills`, `experiences`, `achievements`, `messages`, and `profiles`. Resume binaries are stored by GridFS in `resumes.files` and `resumes.chunks`; the profile document stores each GridFS file ID. MongoDB calls these collections, not tables, and you do not need to create them manually. Keep the same database name in `MONGODB_URI` to connect this deployment to your existing portfolio data.

Do not commit `.env` or put secrets in `VITE_*` variables. Vite variables are public in the built frontend. The committed `.env.example` contains placeholders only; configure real values in the hosting dashboards.

## Project structure

- `client/` - Vite React frontend
- `server/` - Express API and MongoDB models
- `README.md` - project overview

## Scripts

- `npm run dev` - starts the frontend and backend together
- `npm run build` - builds the frontend for production
- `npm run server` - runs the backend in dev mode
- `npm run client` - runs the frontend in dev mode
- `npm run start` - runs the backend production server
- `npm test` - validates the project model exports

## Admin access

- Login: `http://localhost:5173/admin/login`
- Dashboard: `http://localhost:5173/admin/dashboard`
- Public portfolio: `http://localhost:5173/`

The backend sets an HTTP-only authentication cookie and also keeps the existing bearer-token response for compatibility with the current client. MongoDB is required for persistent admin CRUD changes; fallback mode is intended for public development previews.
