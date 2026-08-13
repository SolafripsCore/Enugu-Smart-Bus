# Enugu Smart Bus — Web

Redesigned marketing and account website for **Enugu Smart Bus (ESB)**, the smart
public transport system operated by Blue Noble Motors Limited in Enugu State.

Built with Next.js (App Router), TypeScript and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
```

Accounts, login and the wallet talk to the ESB API (see the `esb-api` project).
Point the app at it with `NEXT_PUBLIC_API_URL` (default `http://localhost:8000`).
A static preview can be produced with `STATIC_EXPORT=1 npm run build`, which
writes `out/`.

## Scripts

| Script           | Description                            |
| ---------------- | -------------------------------------- |
| `npm run dev`    | Start the development server           |
| `npm run build`  | Production build (also typechecks)     |
| `npm run start`  | Serve the production build             |
| `npm run lint`   | ESLint (next/core-web-vitals)          |
| `npm run format` | Format with Prettier                   |

## Project structure

```
src/
  app/
    (site)/            Public marketing pages + shared header/footer/chat widget
    (auth)/            Login, signup and forgot-password (split-screen layout)
    layout.tsx         Fonts, global metadata, Open Graph / Twitter cards
    sitemap.ts         Generated sitemap
    robots.ts          Generated robots.txt
  components/
    layout/            SiteHeader, SiteFooter
    ui/                Button, Section, Reveal, Icons — the design-system primitives
    ...                Page-level building blocks (hero, testimonials, accordion, forms)
  lib/site.ts          Single source of truth for copy, navigation, routes and data
public/images/         Optimised WebP assets
```

All site copy, navigation, services, FAQs, blog posts and team data live in
`src/lib/site.ts`, so content changes never require touching page markup.

## Design system

- **Colours** — navy (`navy-*`) for structure, grass green (`grass-*`) for actions, `sand` for section contrast
- **Type** — Inter for body, Sora for display headings (loaded via `next/font`)
- **Utilities** — `heading-xl/lg/md`, `body-lg`, `card-surface` in `globals.css`
- **Motion** — `Reveal` (IntersectionObserver fade-up), all animation disabled under `prefers-reduced-motion`

## Notes / next steps

Login, signup, password reset, the wallet and trip history are wired to the ESB
API. When that API can't be reached (for example on a static preview with no API
host attached) the app falls back to `src/lib/demoBackend.ts`, an in-browser
stand-in that keeps accounts in `localStorage` so the signed-in experience can
still be demonstrated; the UI shows a "preview mode" notice when that happens.

Still to wire up: the contact and newsletter forms, Google sign-in, real reset
emails (the API returns the reset token while no mail provider is connected),
and the "Ask Ijeoma" assistant, which is currently a scripted FAQ widget.
