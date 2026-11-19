# MozhiMatch — Bilingual MCQ Preflight

**MozhiMatch** is an English–Tamil MCQ quality review workbench for examination editors and educators.

When publishing bilingual question papers (e.g. TNPSC, civil service exams, university tests), an editor must ensure that questions and labelled options convey identical meaning in both languages. MozhiMatch checks structural consistency and semantic equivalence, highlights exact evidence in the source text, and lets the human reviewer mark each finding **Keep**, **Fix**, or **Escalate**.

---

## Key Features

1. **Paired MCQ Editor**
   - Side-by-side editing of English and Tamil stems (up to 2,000 characters) and labelled options A–E (up to 400 characters).
   - Character count tracking and Unicode NFC normalization.
   - Built-in Tamil typography with local `@fontsource/noto-sans-tamil` and `1.7` line-height.

2. **Deterministic Structural Checks (Zero-Paid Default)**
   - Option count mismatch (`OPTION_COUNT_MISMATCH`).
   - Duplicate or missing option labels (`DUPLICATE_OPTION_LABEL`, `OPTION_LABEL_MISMATCH`).
   - Numeric token difference (`NUMERIC_TOKEN_DIFFERENCE`) with Tamil numeral conversion (`௦-௯` to ASCII `0-9`).
   - Scientific and exam unit discrepancies (`UNIT_TOKEN_DIFFERENCE`) across English and Tamil terms.

3. **Grounded Semantic AI Review (Gemini)**
   - Structured JSON analysis via server-side Google Gemini REST endpoint (`server-only`).
   - Strict quote validation requiring exact, contiguous substrings in both source versions with UTF-16 code unit offset verification.
   - Grapheme cluster boundary protection (never splits Tamil vowel signs or Virama).
   - Safe failure default: If model output is missing, malformed, or has invalid quotes, the item is marked `Needs review`—never a false clear.

4. **Human Review Decisions & Plain-Text Export**
   - Reviewer marks each finding: **Keep wording**, **Fix wording**, or **Ask a reviewer** (Escalate).
   - One-click copyable plain-text issue summary export formatted for editorial review.

5. **Bilingual UI**
   - Full interface localization in English and Tamil (தமிழ்) using symmetric translation keys.
   - Distinctive neobrutalist design with 2px borders, hard shadows, warm paper background, and visible 24px grid.

---

## Quick Start

### Prerequisites
- Node.js >= 24 (Node 25 LTS supported)
- npm >= 11

### 1. Installation
```bash
npm install
```

### 2. Environment Configuration
Create `.env.local` based on `.env.example`:
```bash
cp .env.example .env.local
```

Settings:
```ini
AI_MODE=off                      # "on" to enable live Gemini calls, "off" for rules-only
GEMINI_API_KEY=                  # Server-side Gemini API key (never exposed to client)
GEMINI_MODEL=gemini-2.5-flash    # Candidate model (or gemini-1.5-flash)
DEPLOYMENT_MODE=public_demo      # "public_demo" (restricts AI to allowlist) or "local"
APP_ORIGIN=http://localhost:3000 # Exact origin validation
DEMO_ACCESS_CODE=                # Private operator capability code
```
*Note: The app runs in full rules-only mode without any API key or paid services.*

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Test Suites
```bash
# Run unit and API tests (Vitest)
npm run test

# Run TypeScript type check
npm run typecheck

# Run ESLint
npm run lint

# Run development evaluation runner
npm run eval:development
```

### 5. Production Build
```bash
npm run build
npm start
```

---

## Test & Benchmark Fixtures

MozhiMatch includes 5 synthetic practice items in `src/fixtures/development.json`:
- `DEV_NEGATION`: English stem has "NOT renewable", Tamil omits "அல்லாத" (Meaning changed: negation drop).
- `DEV_VERB`: English stem has "school received an award", Tamil says "school gave an award" (Meaning changed: verb direction).
- `DEV_CLEAN`: Clean parallel prime number question (No issues found).
- `DEV_UNCERTAIN`: Transliterated initial "K. Ravi" vs "க. ரவி" (Uncertain / needs review).
- `DEV_STRUCTURE`: English has 4 options (A-D), Tamil has 3 options (A-C) (Option count mismatch).

---

## Deployment Instructions

### Vercel Deployment
1. Connect the GitHub repository `https://github.com/mohamed-kaif-1/MozhiMatch.git`.
2. Configure Environment Variables in Vercel project settings:
   - `AI_MODE`: `off` (or `on` if providing a Gemini key)
   - `GEMINI_API_KEY`: `<your_gemini_api_key>` (optional)
   - `GEMINI_MODEL`: `gemini-2.5-flash`
   - `DEPLOYMENT_MODE`: `public_demo`
   - `APP_ORIGIN`: `https://<your-project>.vercel.app`
   - `DEMO_ACCESS_CODE`: `<operator_secret_code>`
3. Deploy! Next.js App Router static pages and API routes (`/api/analyze`, `/api/health`) will build automatically.

---

## Provenance and Disclosure
- The development dataset consists of original synthetic authored practice questions to ensure zero copyrighted examination content is redistributed.
- Evaluations are conducted on small-scale test sets; repeat-use familiarity and small sample size limitations are acknowledged.
- Source quotations and human decisions are kept in browser memory and reset on refresh or edit.
