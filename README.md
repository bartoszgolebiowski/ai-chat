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

| Synthesizer | Prompts Used | Speed | LLM Calls | Simple Explanation |
|-------------|--------------|-------|-----------|-------------------|
| **simple_summarize** | summary_template | ⚡ Very Fast | 1 | Cuts text to fit one prompt, quick but may lose info |
| **no_text** | None | ⚡⚡ Instant | 0 | Just fetches nodes without LLM processing |
| **context_only** | None | ⚡⚡ Instant | 0 | Returns raw concatenated text chunks |
| **accumulate** | qa_template | 🐌 Slow | N (per chunk) | Runs same query on each chunk separately |
| **compact_accumulate** | qa_template | 🐌 Slow | ≤N (per compacted chunk) | Like accumulate but compacts chunks first |
| **tree_summarize** | summary_template | 🐌 Very Slow | Log(N) recursive | Builds summary tree by recursively summarizing |
| **compact** | qa_template | ⚡ Fast | 1-2 | Compacts chunks, then processes (default) |
| **refine** | refine_template + qa_template | 🐌 Slow | N (per chunk) | Builds answer step-by-step through each chunk |

**Key:**
- N = Number of text chunks
- ⚡⚡ = Instant (no LLM)
- ⚡ = Fast (1-2 calls)
- 🐌 = Slow (multiple calls)

**Quick Recommendations:**
- **Fast & Simple**: Use `compact` (default)
- **Maximum Detail**: Use `refine` 
- **Just Retrieval**: Use `no_text`
- **Large Datasets**: Use `tree_summarize`