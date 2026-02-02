# daykeeper.app

Daykeeper is a journal-style social media that blends a social networking with journaling methods, like the Bullet Journal. This repo contains the web client for Daykeeper. <br />
This webapp uses the [Daykeeper API](https://github.com/luciano655dev/daykeeper-api).

Live: https://daykeeper.app

## Highlights

- Daily planning with tasks, notes, and events
- Social feed with posts, likes, comments, and profiles
- Notifications and follow requests
- Settings for privacy, devices, blocks, and account management

## Tech Stack

- Next.js (App Router)
- React
- Tailwind CSS v4
- TanStack Query
- TypeScript

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:3000` by default.

## API / Backend

The app expects a Daykeeper API. Configure the base URL in `config.ts`:

```ts
export const API_URL = "https://daykeeper-api.onrender.com"
// export const API_URL = "http://localhost:3001"
```

## Contributing

PRs welcome!
If you plan to work on a new feature, please open an issue first so we can align on scope.

## Contact
You can contact through
- [Email (contact@daykeeper.app)](contact@daykeeper.app)
- [Instagram (@daykeeperapp)](https://instagram.com/daykeeperapp)

or directly to [my Twitter (@luciano655dev)](https://x.com/luciano655dev)

## License

Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0).
