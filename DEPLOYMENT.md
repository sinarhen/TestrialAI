# TestrialAI Deployment Guide

## Vercel Deployment

This project is configured for deployment on Vercel. Follow these steps to deploy:

### Prerequisites

1. **Install Vercel CLI**:

   ```bash
   npm i -g vercel
   ```

2. **Set up external services**:
   - **Database**: Create a Turso database at [turso.tech](https://turso.tech)
   - **Redis**: Create an Upstash Redis database at [upstash.com](https://upstash.com)
   - **OpenAI**: Get API key from [platform.openai.com](https://platform.openai.com)
   - **OAuth Apps**: Set up GitHub and Google OAuth applications

### Deployment Steps

1. **Connect to Vercel**:

   ```bash
   vercel login
   vercel link
   ```

2. **Set Environment Variables** in Vercel Dashboard or using CLI:

   ```bash
   # Database (Turso)
   vercel env add DATABASE_URL
   # Example: libsql://your-db.turso.io?authToken=your-token

   # Redis (Upstash)
   vercel env add REDIS_URL
   # Example: rediss://your-redis.upstash.io:6380

   # OpenAI
   vercel env add OPENAI_API_KEY
   vercel env add OPENAI_DEFAULT_MODEL
   vercel env add OPENAI_COMPLETION_TOKEN_LIMIT

   # OAuth
   vercel env add GITHUB_CLIENT_ID
   vercel env add GITHUB_CLIENT_SECRET
   vercel env add GOOGLE_CLIENT_ID
   vercel env add GOOGLE_CLIENT_SECRET

   # Email
   vercel env add GOOGLE_APP_EMAIL
   vercel env add GOOGLE_APP_PASSWORD

   # Security (generate random strings)
   vercel env add SIGNING_SECRET
   vercel env add TOKEN_SECRET

   # Environment
   vercel env add ENV
   vercel env add PORT
   vercel env add PUBLIC_DEV_BASE_URL
   vercel env add PUBLIC_PROD_BASE_URL
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

### Database Setup

1. **Create Turso Database**:

   ```bash
   # Install Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash

   # Create database
   turso db create testrial-ai

   # Get database URL and auth token
   turso db show testrial-ai
   ```

2. **Run Migrations**:
   ```bash
   # Set DATABASE_URL to your Turso URL
   npm run db:push
   ```

### Redis Setup

1. Create an Upstash Redis database
2. Copy the Redis URL from the dashboard
3. Add it to your Vercel environment variables

### OAuth Setup

#### GitHub OAuth:

1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL to: `https://your-app.vercel.app/api/auth/github/callback`

#### Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Set redirect URI to: `https://your-app.vercel.app/api/auth/google/callback`

### Environment Variables Reference

| Variable                        | Description                        | Example                              |
| ------------------------------- | ---------------------------------- | ------------------------------------ |
| `DATABASE_URL`                  | Turso database URL with auth token | `libsql://db.turso.io?authToken=...` |
| `REDIS_URL`                     | Upstash Redis URL                  | `rediss://redis.upstash.io:6380`     |
| `OPENAI_API_KEY`                | OpenAI API key                     | `sk-...`                             |
| `OPENAI_DEFAULT_MODEL`          | Default OpenAI model               | `gpt-4-turbo-preview`                |
| `OPENAI_COMPLETION_TOKEN_LIMIT` | Token limit for completions        | `4000`                               |
| `GITHUB_CLIENT_ID`              | GitHub OAuth client ID             | `Ov23li...`                          |
| `GITHUB_CLIENT_SECRET`          | GitHub OAuth client secret         | `...`                                |
| `GOOGLE_CLIENT_ID`              | Google OAuth client ID             | `...`                                |
| `GOOGLE_CLIENT_SECRET`          | Google OAuth client secret         | `...`                                |
| `GOOGLE_APP_EMAIL`              | Gmail address for sending emails   | `your-app@gmail.com`                 |
| `GOOGLE_APP_PASSWORD`           | Gmail app password                 | `...`                                |
| `SIGNING_SECRET`                | Secret for signing tokens          | `32+ character random string`        |
| `TOKEN_SECRET`                  | Secret for JWT tokens              | `32+ character random string`        |
| `ENV`                           | Environment                        | `prod`                               |
| `PORT`                          | Port number                        | `3000`                               |
| `PUBLIC_DEV_BASE_URL`           | Development base URL               | `http://localhost:5173`              |
| `PUBLIC_PROD_BASE_URL`          | Production base URL                | `https://your-app.vercel.app`        |

### Troubleshooting

1. **Build Errors**: Check the Vercel build logs
2. **Database Connection**: Verify Turso URL and auth token
3. **Redis Connection**: Verify Upstash Redis URL
4. **OAuth Issues**: Check redirect URLs match exactly
5. **Environment Variables**: Ensure all required variables are set

### Local Development

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables

3. Start development server:

   ```bash
   npm run dev
   ```

   turso=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiI3MmYxMjdhYi1kMGIwLTRiNjAtOWViNS04YjA1N2JhZGI5MjUiLCJpYXQiOjE3NTcwNjc2NjQsInJpZCI6IjIyNDM4OTU2LTgyYTItNDgxOS04ZmNlLTM1ZTc4OWM1ZWI0MCJ9.lfU34bJ6fU4XDtZlExv8fq53d7vXNHQuq3KH4EdULt3WPmZ3c7kr40Tc0V45yUrvqpGJG1TumiQU_LW_MGrkDg

UPSTASH_REDIS_REST_URL="https://fond-ox-10685.upstash.io"
UPSTASH_REDIS_REST_TOKEN="ASm9AAIncDE3ZGM1ZGEzOTQxNGY0OTlkYTdhZTBiNzIxNjIwNjI3NXAxMTA2ODU"
