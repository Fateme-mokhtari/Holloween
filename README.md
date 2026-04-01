# Halloween Scare Zones Map

A Next.js web application for mapping and showcasing Halloween scare zones and haunted houses.

## Features

- 🎃 Interactive map with house locations
- 👻 Real-time house data fetching
- 📍 Pumpkin emoji markers for easy identification
- 🎨 Responsive design with Tailwind CSS
- 🗺️ Leaflet.js integration

## Tech Stack

- Next.js 16.1.6
- React
- Tailwind CSS
- Leaflet
- TypeScript

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Environment Variables

Create a local environment file:

```bash
cp .env.example .env.local
```

Required values:

- `API_BASE_URL`: server-side API base URL
- `ADMIN_TOKEN`: server-side token for authenticated API requests

## Security Notes

- Never commit `.env.local` or any real secret values.
- Rotate secrets immediately if they are shared by mistake.
- Keep `ADMIN_TOKEN` server-side only.

## Scripts

```bash
pnpm dev
pnpm test
pnpm lint
pnpm build
```

## Project Status

🚧 **In Development** - More features coming soon!

## License

MIT
