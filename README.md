# LaunchAI

LaunchAI is a Next.js + Supabase powered platform that automates code reviews and deployment readiness checks. It provides a set of AI agents that can analyze your code, generate pre‑deploy checklists, and help you safely push changes to Vercel.

## Prerequisites

- Node.js 20+ (recommended)
- npm or yarn
- A Supabase project
- A Vercel account

## Local Setup

1. Clone the repository
   ```bash
   git clone https://github.com/your-org/launchai.git
   cd launchai
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the project root and add the following variables.
   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
   ```
   Replace the placeholder values with the credentials from your Supabase project. Do **not** commit this file.

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the Next.js development server |
| `npm run build` | Builds the production bundle |
| `npm run lint` | Runs ESLint on the codebase |
| `npm run test` | Runs the test suite (if any) |

## Project Structure

```
├─ app/                # Next.js App Router pages and API routes
│  ├─ api/             # API endpoints
│  ├─ auth/            # OAuth callbacks
│  ├─ dashboard/       # Authenticated dashboard UI
│  └─ page.js          # Landing page
├─ lib/                # Shared utilities (e.g., Supabase client)
├─ public/             # Static assets
├─ styles/             # Global CSS (if any)
├─ .env.local          # Environment variables (ignored by Git)
└─ package.json        # Scripts and dependencies
```

## Deploying to Vercel

1. Connect your GitHub repository to Vercel.
2. In the Vercel dashboard, add the following environment variables under **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Vercel will automatically run `npm run build` and deploy the app.
4. After deployment, navigate to the dashboard at `https://your-project.vercel.app/dashboard` to start using the agents.

## Troubleshooting

- **Missing environment variables** – The app will throw a 500 error if the Supabase keys are not set. Ensure `.env.local` is present locally and the variables are added in Vercel.
- **CORS errors** – If you see CORS errors when calling the API, make sure the API routes are under `app/api/` and that you are using the correct base URL (`/api/...`).
- **Supabase authentication** – After logging in, you may need to refresh the page to see the dashboard. The auth flow uses Supabase's OAuth; ensure the redirect URL is set correctly in the Supabase dashboard.

## Contributing

Feel free to open issues or pull requests. All contributions are welcome!
