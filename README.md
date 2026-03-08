# 🌊 Skibidi — Weekly Knowledge Quiz

Built with love for Ruby & Eli 🌴

A mobile-first weekly quiz app combining healthy competition, gamification, and structured knowledge development across **Maths**, **English Vocabulary**, and **Bible (NIV)**.

---

## Quick Start

### 1. Clone and install

```bash
cd skibidi
npm install
```

### 2. Set up environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project → Settings → API (keep secret!) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `CRON_SECRET` | Any random string (e.g. `openssl rand -hex 32`) |

### 3. Set up Supabase database

1. Go to your Supabase project → SQL Editor
2. Run `supabase/migrations/001_initial_schema.sql`
3. Run `supabase/seed.sql` (creates Ruby, Eli, and Dad profiles)

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Set PINs

On first login, each user will be prompted to set their 4-digit PIN.

---

## Deployment (Vercel)

1. Push to GitHub (private repo)
2. Import in [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel project settings
4. Deploy!

The `vercel.json` cron job triggers question generation every **Sunday at 22:00 UTC** (midnight SAST Monday).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + React + Tailwind CSS |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Custom PIN flow via Supabase |
| AI / Questions | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Hosting | Vercel |

---

## App Structure

```
app/
├── page.tsx              # Home — profile selection
├── pin/[userId]/         # PIN entry & setup
├── home/                 # Dashboard after login
├── quiz/                 # Quiz engine
├── leaderboard/          # Weekly + all-time rankings
├── profile/              # Stats, badges, trophies
├── dashboard/            # Parent read-only view
└── api/
    ├── generate-questions/  # Claude AI question generation (cron)
    ├── questions/           # Fetch this week's questions
    ├── answers/             # Submit answers + scoring
    ├── scores/              # Get stats
    ├── leaderboard/         # Head-to-head data
    ├── badges/              # Badge collection
    └── auth/                # PIN verify + set
```

---

## Scoring

| Scenario | Points |
|---|---|
| Correct, under 10 seconds | 3 pts |
| Correct, 10–20 seconds | 2 pts |
| Correct, over 20 seconds | 1 pt |
| Wrong answer | 0 pts |
| **Maximum weekly score** | **90 pts** |

---

## Badges

| Badge | Trigger |
|---|---|
| 🔥 Hot Streak | 3 consecutive weeks completed |
| 🌊 Wave Rider | 5 consecutive weeks |
| 🏄 Surf Champion | 10 consecutive weeks |
| 🌴 Island Legend | 20 consecutive weeks |
| ⚡ Speed Demon | Average answer time under 10s for a full week |
| 📚 Scholar | Perfect score in any one subject |

---

Built with ❤️ for Ruby & Eli 🌴
