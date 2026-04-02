This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Project-specific notes

This frontend talks to the PocketBase backend running at `http://localhost:8090`.

- Authentication is handled via the `users` collection. You can register or log in using the forms available under `/register` and `/login`.
- The layout displays links based on whether you are logged in and if you have admin privileges (the `isAdmin` flag on the user record).
- Regular users can file complaints and chat with admins on `/chat`.
- Admins can visit `/admin/chats` to read all messages and reply – choose a recipient from the dropdown and send.

To run the frontend:

```bash
cd frontend
npm install      # ensure dependencies (including pocketbase, tailwindcss)
npm run dev
```

You should see the app on http://localhost:3000. Ensure the backend is running before trying to login or chat.

