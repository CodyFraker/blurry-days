# 📸 Grainydays Drinking Game Generator

A retro-themed web app that generates a custom drinking game based on recent YouTube videos from the [Grainydays](https://www.youtube.com/@grainydaysss) film photography channel. Users select a video, choose how drunk they want to get, and receive a dynamic ruleset that they can share with friends.

---

## 🎯 Project Goal

This app lets users:
- Pick a recent video from Grainydays
- Set an intoxication level using a slider
- Receive a ruleset of up to 5 drinking prompts
- Add or modify rules manually
- Share the final game via a unique link (valid for 90 days)

---

## 🛠 Tech Stack

| Layer        | Tech                               |
|--------------|------------------------------------|
| Frontend     | [SvelteKit](https://kit.svelte.dev) |
| Backend      | SvelteKit API endpoints            |
| Database     | PostgreSQL                         |
| ORM          | [Drizzle ORM](https://orm.drizzle.team/) |
| Testing      | [Vitest](https://vitest.dev)       |

---

## 🚀 Quick Start with Docker

The easiest way to get started is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd blurry-days

# Start the development environment
docker-compose up -d

# The app will be available at http://localhost:5173
# Database will be available at localhost:5432
```

### Docker Services

- **App**: SvelteKit development server on port 5173
- **PostgreSQL**: Database on port 5432
  - Database: `grainydays`
  - User: `grainydays`
  - Password: `grainydays_dev`

---

## 🛠 Development Setup

### Prerequisites

- Node.js 18+ 
- Docker and Docker Compose
- PostgreSQL (if not using Docker)

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your database connection
   ```

3. **Database setup:**
   ```bash
   # Generate database migrations
   npm run db:generate
   
   # Apply migrations
   npm run db:migrate
   
   # Or push schema directly (development)
   npm run db:push
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

### Database Management

```bash
# Generate migrations from schema changes
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema directly (development only)
npm run db:push

# Open Drizzle Studio
npm run db:studio
```

---

## 📦 Features

### 🎥 YouTube Video Fetch

- Pulls the latest videos using the public **RSS feed**
- Displays thumbnails, titles, and upload dates
- Allows users to pick a video to base their game on

### 🍻 Rule Generation Engine

Each rule consists of:
- `text`: The rule content (may contain dynamic placeholders)
- `category`: Used for category diversity in selection
- `weight`: A float from 0 to 1 determining frequency
- `baseDrink`: Enum representing intensity

```ts
enum Drink {
  Sip = 0,
  Gulp = 1,
  Pull = 2,
  Shot = 3
}
```

**Rule Selection Logic:**
- By default, 5 rules are selected
- Categories: 2–3 categories are chosen for diversity
- Rules are selected via weighted randomness
- User selects a slider value (3–5 steps)
- `effectiveDrink = baseDrink + sliderStep`, capped at max enum

### ✍️ Custom Rule Editor

Users can:
- Add their own rules
- Edit or replace existing generated rules
- Includes client-side validation:
  - Filters out vulgar, racist, or offensive content using a basic wordlist or regex

### 🔗 Shareable Game Links

- Finalized rulesets are saved to the database
- Generates a shareable link: `/game/:id`
- Rulesets expire after 90 days (`expiresAt`)
- Optional: Background cron job or DB TTL cleanup

---

## 🧪 Testing Strategy

All features are covered by Vitest unit and integration tests:

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

Test cases cover:
- Rule weighting logic
- Slider amplification math
- Rule category diversity
- Custom rule validation
- API endpoints for game creation and fetch
- Expiration logic (e.g., mocking timestamps)

---

## 🎨 Design Goals

- **Responsive design** (mobile-first)
- **Retro film/camera aesthetics**:
  - Polaroid borders
  - Filmstrip accents
  - Grain overlays
  - UI slider styled like an ISO or aperture dial
  - Analog-style animations (e.g., film roll generation)

---

## 🏗 Project Structure

```
src/
├── lib/
│   ├── db/           # Database schema and connection
│   ├── rules/        # Rule generation engine
│   └── youtube/      # RSS parser for YouTube videos
├── routes/
│   ├── api/          # SvelteKit API endpoints
│   ├── game/[id]/    # Game display page
│   └── +page.svelte  # Homepage
└── app.css           # Global styles
```

---

## 🔧 Developer Notes

- Uses `@drizzle-orm/postgres-js` for schema setup and queries
- RSS is used instead of YouTube API to avoid quota limits
- UUIDs are used for sharing game instances; JWTs are optional
- For rule filtering, consider a simple profanity filter or use a 3rd-party package

---

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Preview the build
npm run preview
```

### Environment Variables

```bash
DATABASE_URL=postgres://user:password@host:port/database
NODE_ENV=production
```

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

---

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.