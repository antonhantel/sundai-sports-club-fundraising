# TeamFund - Sports Club Fundraising Platform

A Next.js application for managing sports team fundraising, sponsor outreach, and marketing assets.

## Quick Start 

### Prerequisites

- Node.js 18+ and pnpm
- A Supabase account (free tier works)
- (Optional) Nanobanana API key for jersey mockup generation

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables (see [Environment Variables](#environment-variables) below)

4. Run database migrations (see [Supabase Setup Guide](./SUPABASE_SETUP.md))

5. Start the development server:
   ```bash
   pnpm dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```bash
# Supabase Configuration
# Get these from your Supabase project: Settings → API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional Variables

```bash
# Google Gemini Nano Banana (Flash 3) for Jersey Mockup Generation
# Required if you want to generate jersey mockups
# Uses gemini-2.5-flash-image model (fast) or gemini-3-pro-image-preview (pro)
# Free tier available, then pay-per-use (check Google AI pricing)
# Alternative: Set NANOBANANA_API_URL to use a different provider (Replicate, DALL-E, etc.)
NANOBANANA_API_KEY=your_google_gemini_api_key
# NANOBANANA_API_URL=https://custom-endpoint.com (optional, for other providers)

# OpenAI API (for future use - outreach email generation)
# OPENAI_API_KEY=your_openai_api_key

# Google Places API (for future use - lead discovery)
# GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

### Environment Variables Reference

| Variable | Required | Description | Where to Get It |
|----------|----------|-------------|-----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Your Supabase anonymous/public key | Supabase Dashboard → Settings → API |
| `NANOBANANA_API_KEY` | ⚠️ Optional | Google Gemini API key for jersey mockup generation (Nano Banana Flash 3) | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `NANOBANANA_API_URL` | ⚠️ Optional | Custom API endpoint (if using a different provider) | Leave empty to use Gemini Nano Banana |
| `OPENAI_API_KEY` | ⚠️ Future | For AI-powered outreach email generation | [OpenAI Platform](https://platform.openai.com) |
| `GOOGLE_PLACES_API_KEY` | ⚠️ Future | For business lead discovery | [Google Cloud Console](https://console.cloud.google.com) |

## Setup Instructions

### 1. Supabase Setup

Follow the detailed guide in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) to:
- Create a Supabase project
- Run database migrations
- Set up storage buckets
- Configure authentication

### 2. Image Generation Setup (Optional)

If you want to use jersey mockup generation:

1. **Default (Google Gemini Nano Banana Flash 3)**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Model: `gemini-2.5-flash-image` (fast) or `gemini-3-pro-image-preview` (pro)
   - Free tier available, then pay-per-use
   - All images include SynthID watermark for authenticity
   
2. **Alternative Options** (see code comments in `app/api/assets/route.ts`):
   - Replicate (Stable Diffusion) - Lowest cost, ~$0.002-0.003 per image
   - DALL-E 3 (OpenAI) - Highest quality, ~$0.040 per image
   - Stability AI - Good balance, ~$0.004 per image
   - Hugging Face - Free tier available
   
3. Add `NANOBANANA_API_KEY` to your `.env.local` (works with any provider)
4. If using a custom provider, set `NANOBANANA_API_URL` to the endpoint
5. Customize the prompt in `lib/jersey-prompt.ts` if needed

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/      # Dashboard pages
│   └── onboarding/         # Onboarding flow
├── components/            # React components
├── lib/                   # Utilities and helpers
│   ├── supabase/         # Supabase client configuration
│   ├── jersey-prompt.ts  # Jersey mockup prompt configuration
│   └── store.tsx         # Global state management
├── supabase-migration.sql      # Database schema
├── supabase-rls-policies.sql   # Row Level Security policies
└── supabase-storage-setup.sql # Storage bucket setup
```

## Features

- ✅ Email-based authentication with Supabase
- ✅ Team onboarding and profile management
- ✅ Lead management and tracking
- ✅ Outreach email and proposal generation
- ✅ Jersey mockup generation (with Nanobanana)
- ✅ Marketing asset management
- ✅ Row Level Security for data isolation

## Development

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy!

Make sure to add all required environment variables in your Vercel project settings.

## Customization

### Jersey Mockup Prompts

Edit `lib/jersey-prompt.ts` to customize how jersey mockups are generated. The prompt supports variables:
- `{teamName}` - Team name
- `{primaryColor}` - Primary color (hex)
- `{secondaryColor}` - Secondary color (hex)
- `{sponsorName}` - Sponsor name (optional)

## Troubleshooting

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed troubleshooting guides.

### Common Issues

- **"Unauthorized" errors**: Check your Supabase environment variables
- **Jersey generation fails**: Verify `NANOBANANA_API_KEY` is set correctly
- **Storage upload errors**: Make sure you've run `supabase-storage-setup.sql`

## License

Private project
