Here’s a complete PRD for **Option A**: building your game as a **serverless Telegram Mini App on Cloudflare (Pages + Workers) with a Python-coded narrative engine**. This is the foundation to align on before writing any more code.

---

# 1. Product Overview

## 1.1 Product Summary

- **Product:** Telegram Mini App + bot for a cyberpunk romance/temptation simulation game.
- **Working title:** Echocity: Glass Hearts.
- **Core fantasy:** Navigate love and temptation in a full‑cyberpunk city (Echocity), torn between:
  - Calvin (tower exec, power/control),
  - Jackson (undercity fixer, chaos/escape),
  - Cole (network ghost/hacker, meta/control of perception).
- **Platform:**
  - Telegram Bot + WebApp (Mini App) UI.
  - Hosted on Cloudflare:
    - **Cloudflare Pages** → frontend Mini App.
    - **Cloudflare Workers + KV/D1** → backend API + state.
- **Business goal:** Monetize via:
  - Route packs (Calvin first),
  - Premium scenes/choices,
  - Light energy system,
  - Cosmetics/titles,
  while delivering a story‑heavy, dark, seductive cyberpunk experience.

---

# 2. Users & Personas

## 2.1 Primary Personas

1. **Story-Driven Romance Gamer**
   - Loves visual novels / interactive fiction.
   - Wants emotional stakes, tension, meaningful choices.
   - Tolerates paying for extra routes/endings if core is strong.

2. **Cyberpunk / Sci‑Fi Fan**
   - Attracted by setting: neon dystopia, corporations, hacking.
   - Enjoys moral ambiguity, conspiracies, meta commentary.

3. **Telegram‑Native Power User**
   - Lives in Telegram.
   - Wants “no‑install” game.
   - Familiar with bots, inline keyboards, and WebApps.

---

# 3. Core Experience

## 3.1 Game Loop

1. Player opens Telegram bot (`/start` or tap WebApp button).
2. Mini App loads:
   - Fetches state via backend (`/api/state`).
   - Renders current scene (story text + choices).
3. Player selects a **choice**:
   - Frontend calls `/api/choice` with:
     - `scene_id`, `choice_id`, Telegram `initData`.
   - Backend:
     - Validates user (via Telegram WebApp signature).
     - Loads user state from DB/KV.
     - Applies choice effects (stats, flags, packs).
     - Resolves `next_scene_id`.
     - Returns new `state + scene`.
4. Frontend renders next scene. Repeat.
5. Periodic:
   - Chapter summaries.
   - Monetization offers (Calvin Extended Route, premium scenes).
   - Cross‑route teasers (Jackson/Cole collisions).

---

# 4. Game Design

## 4.1 Stats & State

Per user:

- `telegram_id`
- `current_scene_id`
- **Stats** (0–100):
  - `love_integrity` – capacity for real connection, honesty.
  - `temptation` – pull toward power/pleasure/escape.
  - `career_status` – position within AmourCorp/Echocity.
- **Route flags**:
  - `calvin_route_active`, `jackson_route_active`, `cole_route_active`.
- **Relationship flags**:
  - `calvin_contract_signed`, `calvin_kissed`, `calvin_morning_regret`, etc.
  - `jackson_shadow_mode`, `jackson_debt_pact`, `jackson_confession_closeness`.
  - `cole_archive_deep_dive`, `cole_route_active`, `jackson_helped_cole_past`.
- **Monetization flags**:
  - `packs_owned: [ "CALVIN_S1", "JACKSON_S1", "COLE_S1" ]`
  - `items_owned: [ "CALVIN_SCENE1", "CALVIN_ACCESS", "CALVIN_TITLE", ... ]`
- **Energy**:
  - `energy` (Night Cycles / actions remaining).
- **Meta**:
  - `last_active_at`
  - `titles_owned`, `active_title`.

## 4.2 Scene Model

Scenes are content units, stored as JSON or equivalent:

- `id`: unique scene ID.
- `character`: Calvin / Jackson / Cole / collision / neutral.
- `chapter`: numeric or string (e.g., `1`, `2`, `"collision"`).
- `text`: array of paragraphs (frontend joins with spacing).
- `choices`: list of choice objects:
  - `id`
  - `label`
  - `effects` (stat deltas + custom keys like `jackson_trust`)
  - `set_flags` / `clear_flags`
  - `requires_pack` (e.g., `"CALVIN_S1"`)
  - `requires_item` (e.g., `"CALVIN_SCENE1"`)
  - `energy_cost` (optional, default 1)
  - `next_scene_id`
- `conditions` (optional):
  - `all_flags_true`, `any_flags_true`, `min_stats`, etc.
- `premium_paywall` (optional) for premium‑locked choices.

The **engine** is deterministic: given `user_state + scene + choice`, it computes updated `user_state` and `next_scene`.

---

# 5. Content Scope (v1)

## 5.1 Calvin – Chapter 1 (Complete, Free)

- Scenes: ~12–14.
- Already designed & fully written:
  - `intro_02_calvin_gala`
  - `calvin_02_floor_show`
  - `calvin_03_private_offer`
  - `calvin_04_contract_room`
  - `calvin_05_touch_test`
  - `calvin_05_negotiation`
  - `calvin_06_public_scene`
  - `calvin_07_rooftop_choice`
  - `calvin_08_moment`
  - `calvin_08_moment_cold`
  - `calvin_08_moment_conflicted`
  - `calvin_09_morning_after_data`
  - `calvin_10_ch1_outcome`
- Function:
  - Introduces Calvin, tower, contracts, emotional telemetry.
  - Ends with Chapter 1 report + offer for **CALVIN_S1**.

## 5.2 Calvin – Chapter 2 (Extended Route, Paid via CALVIN_S1)

- Target: 7–10 scenes, including:
  - `calvin_ch2_intro` (lab intro – written).
  - `calvin_ch2_briefing` (model explanation – to finalize).
  - `calvin_ch2_live_test` (Subject #34 – written).
  - `calvin_ch2_rival_intro` (Serena Vale intro – written).
  - `calvin_ch2_private_01` (bridge rooftop/corridor – written).
  - `calvin_ch2_confront_undercity` (knows you go to Jackson – written).
  - `calvin_ch2_climax` (“Spill” incident – written).
  - `calvin_ch2_outcome` (summary + set up Ch3).

## 5.3 Jackson – Chapter 1 (Free Intro)

- Scenes: 8–10.
- Core beats:
  - `jackson_01_club_arrival`
  - `jackson_02_inside_club`
  - `jackson_03_smuggling_offer`
  - `jackson_04_scanner_scene`
  - `jackson_05_hand_off`
  - `jackson_06_back_at_club`
  - `jackson_07_rail_edge`
  - `jackson_08_moment`
  - `jackson_09_morning_after`
  - `jackson_10_ch1_outcome`

## 5.4 Jackson – Chapter 2 (Extended Route JACKSON_S1)

- `jackson_ch2_intro` – **written** (Mara / “The Ledger”, Deeper Debts).
- `jackson_ch2_backstory_amourcorp` – **written**.
- `jackson_ch2_job_chain` – several jobs (with JACKSON_FASTPASS hooks).
- `jackson_ch2_betrayal` – someone sells him out.
- `jackson_ch2_climax` – choose pay debt / run / sell him out.
- `jackson_ch2_outcome` – set up Ch3 endings.

## 5.5 Cole – Chapter 1 (Free Intro)

Stored in `cole.json`.

- `cole_ch1_intro` – **written** (“The Static”).
- `cole_ch1_02_ping` – **written** (Playback).
- `cole_ch1_03_offer_archive` – **written**, with premium hook COLE_SCENE1.
- `cole_ch1_04_reflection` – **written** (The Pattern).
- `cole_ch1_05_branch_end` – **written** (Hook, intro to COLE_S1 paywall).

## 5.6 Collision Scenes

- `collision_calvin_jackson_verge` – **outlined & partly JSON‑ified**:
  - Storage unit in Verge.
  - Calvin holo + Jackson physical.
  - Final choice: give case, backup+hand, smash.
- Future: collisions with Cole.

---

# 6. Monetization Design (v1)

## 6.1 Product Types

1. **Route Packs (Primary monetization)**  
   - `CALVIN_S1` – Glass Towers: Extended Route (Ch2 & later).
   - `JACKSON_S1` – Deeper Debts (Ch2 & later).
   - `COLE_S1` – Ghost in the Network: Extended (Ch2+).

2. **Premium Scenes / Choices**
   - `CALVIN_SCENE1` – Midnight Terms (private negotiation in Ch1).
   - `COLE_SCENE1` – Your Archive Deep Dive.
   - Later: `JACKSON_SCENE1` – Back‑Room Confession (written).

3. **Upgrades / Utilities**
   - `CALVIN_ACCESS` – Emotional Access Override (more reactions, small buffs).
   - `CALVIN_FASTPASS` – Tower Fast‑Track (skip admin scenes in Ch2).
   - `ENERGY_10` – Night Cycles refill.

4. **Cosmetics / Titles**
   - `CALVIN_TITLE` – “Calvin’s Experiment”.
   - `JACKSON_TITLE` – “Verge Addict”.
   - `COLE_TITLE` – “Heartline Glitch”.

5. **Bundles**
   - `CALVIN_BUNDLE1` – Tower & Temptation Pack:
     - CALVIN_S1 + CALVIN_SCENE1 + CALVIN_TITLE.
   - Later mirrored bundles for Jackson/Cole.

## 6.2 Monetization Constraints

- Core **Chapter 1 content for all three characters is free**.
- At least one free ending per major route.
- Monetization enhances depth, offers alt paths/endings, not the *only way* to get any resolution.
- Premium choices are:
  - Clearly labeled but in‑world (“Premium” appears last in label).
  - Never the sole “non‑terrible” option.

---

# 7. UX & Flows

## 7.1 Telegram Bot & Mini App Launch Flow

1. User finds bot and starts `/start`.
2. Bot replies with:
   - Short world intro.
   - Button: `Open Echocity Mini App` with `web_app: { url: MINI_APP_URL }`.
3. User taps → Telegram opens WebApp (Mini App).
4. Mini App JS:
   - Reads `Telegram.WebApp.initData`.
   - Calls `/api/state?init_data=...` to get `user_state`.
   - If new user:
     - Backend creates default state (`intro_scene` etc.).
5. Scene rendering begins.

## 7.2 In‑App Flow

- Header (optional in UI):
  - Show stats bars or small icons for `love_integrity`, `temptation`, `career_status`, energy.
- Body:
  - Story text (stack of paragraphs).
- Footer:
  - Buttons for choices (2–4).
  - Premium choices visually marked (e.g., icon or color).

## 7.3 Payments Flow (Conceptual)

- When player selects a premium choice or route pack:
  - Frontend calls a **bot endpoint** or a backend route that:
    - Creates a Telegram invoice / purchase order.
  - After success (via bot webhook or server callback):
    - Backend sets `packs_owned` or `items_owned`.
    - Mini App re‑tries the original premium action.

> Note: Implementation detail (exact payment provider, currency, etc.) is a follow‑up to this PRD; we treat it as “Telegram Payments + Bot” integration.

---

# 8. Architecture & Tech

## 8.1 High‑Level Diagram

- **Telegram Client**
  - Bot chat + Mini App (WebApp).

- **Frontend (Mini App) – Cloudflare Pages**
  - Tech: JS/TypeScript, light framework or vanilla.
  - Responsibilities:
    - Render scenes + choices.
    - Track visual state only (real state lives server‑side).
    - Call backend API with `initData`, `scene_id`, `choice_id`.

- **Backend API – Cloudflare Workers**
  - Environment: JS/TS (Workers runtime).
  - Endpoints:
    - `GET /api/state?init_data=...`
    - `GET /api/scene?scene_id=...`
    - `POST /api/choice` `{ init_data, scene_id, choice_id }`
  - Responsibilities:
    - Validate `initData` signature with bot token.
    - Load/save user state from DB (KV/D1).
    - Apply game logic (using scene data and a port of your Python logic).
    - Expose products list & entitlements (for purchase UI).

- **Data Store – Cloudflare D1 (preferred) or KV**
  - Store:
    - `users` table: state JSON or normalized columns.
    - `purchases` table.
    - `events` table (analytics).
  - Static story content:
    - In Worker bundle or in KV.

- **Telegram Bot – Python (external)**
  - Hosted on e.g. Railway/Render/Cloud Run (not Cloudflare).
  - Responsibilities:
    - Handle `/start`, explain game, send WebApp launch button.
    - Integrate Telegram Payments.
    - On payment success:
      - Call backend API to set entitlements.

*(If you want absolutely everything on Cloudflare, bot could also be a Worker written in JS, but this PRD assumes Python for the bot logic as you requested.)*

## 8.2 Data Model (DB)

**Table: users**

- `telegram_id` (PK)
- `current_scene_id`
- `stats` (JSON: `love_integrity`, `temptation`, `career_status`)
- `flags` (JSON array)
- `packs_owned` (JSON array)
- `items_owned` (JSON array)
- `energy` (int)
- `created_at`, `updated_at`

**Table: purchases**

- `id`
- `telegram_id`
- `product_id` (e.g., `CALVIN_S1`)
- `provider_tx_id`
- `amount`, `currency`
- `created_at`

**Table: analytics_events` (optional but recommended)**

- `id`
- `telegram_id`
- `event_type` (e.g., `scene_view`, `choice_made`, `purchase_success`)
- `scene_id`, `choice_id`, `product_id`
- `properties` (JSON)
- `ts`

---

## 8.3 API Contract (Phase 1)

### Conventions

- All responses are JSON with `Content-Type: application/json`.
- `init_data` must be the verbatim string provided by Telegram WebApp.
- `state_version` increments whenever user state mutates (optimistic locking + caching).
- `scene` payloads match the scene schema in §4.2.

### `GET /api/state`

**Purpose:** Return validated user state plus the scene that should be rendered.

**Request**

```
GET /api/state?init_data=ENCODED_TELEGRAM&locale=en-US
Authorization: none (validated via init_data signature)
```

- `init_data` (required, query): Telegram-signed payload for the active user session.
- `locale` (optional, query): ISO locale hint for future localization.

**Response – 200 OK**

```
{
  "state_version": 3,
  "user_state": {
    "telegram_id": "123456789",
    "current_scene_id": "intro_02_calvin_gala",
    "stats": {
      "love_integrity": 52,
      "temptation": 41,
      "career_status": 48
    },
    "flags": ["calvin_route_active"],
    "packs_owned": ["CALVIN_S1"],
    "items_owned": ["CALVIN_SCENE1"],
    "energy": 5,
    "last_active_at": "2025-11-25T17:05:00Z"
  },
  "scene": {
    "id": "intro_02_calvin_gala",
    "character": "calvin",
    "chapter": 1,
    "text": ["Paragraph 1", "Paragraph 2"],
    "choices": [
      {
        "id": "scan_room",
        "label": "Scan the gala floor",
        "energy_cost": 1,
        "next_scene_id": "calvin_02_floor_show"
      }
    ]
  }
}
```

**Error responses**

- `400` – missing/invalid `init_data`.
- `401` – signature verification failed.
- `500` – unexpected server error.

Errors return:

```
{
  "error": "invalid_init_data",
  "message": "Telegram signature mismatch"
}
```

### `POST /api/choice`

**Purpose:** Apply a player choice to current state, returning the updated state + next scene.

**Request**

```
POST /api/choice
Content-Type: application/json

{
  "init_data": "ENCODED_TELEGRAM",
  "scene_id": "intro_02_calvin_gala",
  "choice_id": "scan_room",
  "client_state_version": 3,
  "idempotency_key": "8bb2c7f6-3a9d-4a3c-bf2f-b4f63257137b"
}
```

- `client_state_version` ensures the client acted on the latest state (reject if stale).
- `idempotency_key` (optional) prevents double-processing on retries.

**Response – 200 OK**

```
{
  "state_version": 4,
  "consumed_energy": 1,
  "events": [
    {"type": "stat_delta", "stat": "love_integrity", "delta": 2},
    {"type": "flag_set", "flag": "calvin_route_active"}
  ],
  "user_state": {
    "telegram_id": "123456789",
    "current_scene_id": "calvin_02_floor_show",
    "stats": {
      "love_integrity": 54,
      "temptation": 40,
      "career_status": 48
    },
    "flags": ["calvin_route_active"],
    "packs_owned": ["CALVIN_S1"],
    "items_owned": ["CALVIN_SCENE1"],
    "energy": 4,
    "last_active_at": "2025-11-26T17:05:00Z"
  },
  "scene": {
    "id": "calvin_02_floor_show",
    "character": "calvin",
    "chapter": 1,
    "text": ["New paragraph"],
    "choices": [
      {
        "id": "lean_into_show",
        "label": "Lean into the spectacle",
        "energy_cost": 1,
        "next_scene_id": "calvin_03_private_offer"
      }
    ]
  }
}
```

**Error responses**

- `400` – missing fields / invalid scene or choice.
- `401` – signature verification failed.
- `409` – `client_state_version` mismatch (client should refetch state).
- `402` – payment required (choice locked behind pack/item) with payload:

```
{
  "error": "premium_required",
  "message": "CALVIN_SCENE1 item required",
  "required_entitlement": "CALVIN_SCENE1"
}
```

- `429` – energy depleted (inform frontend to surface refill flow).

---

# 9. Analytics & Telemetry

### Essential Events

- `start_game` – first open.
- `complete_calvin_ch1`
- `view_calvin_s1_paywall`
- `purchase_calvin_s1_success`
- `view_calvin_scene1_paywall`
- `choice_premium_attempt` (clicked but not purchased).
- `route_switch` (Calvin → Jackson, etc).
- `hit_energy_zero`
- `return_after_7_days` (retention).

All logged server‑side into `analytics_events`.

---

# 10. Non‑Functional Requirements

- **Performance:**
  - API responses < 500ms typical.
  - Scene JSON payloads small (< 50KB).
- **Scalability:**
  - Stateless Workers; D1 as data store.
  - Able to support thousands of daily active users with no code changes.
- **Security:**
  - Validate `initData` signature on every API call using bot token.
  - Only backend updates state; frontend untrusted.
  - Payments: only accept entitlements set from verified bot/payment callbacks.
- **Reliability:**
  - Idempotent choice handling (avoid double increments on retries).
  - Graceful handling of unknown `scene_id`/`choice_id`.

---

# 11. Roadmap & Milestones (Content + Tech)

### Phase 1 – Narrative Engine + Calvin Ch1 + Basic App

- Implement scene engine & API:
  - `/api/state`, `/api/scene`, `/api/choice`.
- Store and serve:
  - Calvin Ch1 scenes in JSON.
- Frontend Mini App:
  - Basic layout, render scenes, handle choices.
- Bot:
  - `/start` + WebApp button.
- No payments yet.

### Phase 2 – Monetization + Extended Calvin

- Implement purchases & entitlements for:
  - `CALVIN_S1`, `CALVIN_SCENE1`, `CALVIN_TITLE`, `CALVIN_ACCESS`.
- Wire:
  - Calvin Ch2 scenes + paywalls.
- Add energy system + `ENERGY_10` pack.
- Add analytics events.

### Phase 3 – Jackson & Cole + Collisions

- Implement Jackson Ch1 scenes + `JACKSON_SCENE1`.
- Implement Cole Ch1 + `COLE_SCENE1` deep dive.
- Add:
  - `calvin_ch2_confront_undercity`.
  - `jackson_ch2_backstory_amourcorp`.
  - `collision_calvin_jackson_verge`.
- Route packs `JACKSON_S1`, `COLE_S1` (structure ready even if content partial).

### Phase 4 – Polish & Live Ops

- Balancing stats & monetization.
- Bug fixes in route transitions/collisions.
- Event packs (e.g., `CALVIN_EVENT` Crisis Night).

---

# 12. Open Decisions (To Clarify Before Coding)

1. **Exact DB choice on Cloudflare:**
   - D1 (relational) vs KV (simpler JSON blobs).  
   - Recommendation: D1 for structured analytics & queries.

2. **Frontend stack:**
   - Vanilla HTML/JS vs lightweight React (Vite) on Pages.
   - Recommendation: simple React or Svelte for easier UI expansion.

3. **Payment provider details:**
   - Likely Telegram Payments via Stripe.
   - Currency initial set: USD (+1–2 key markets later).

4. **Localization:**
   - v1: **English only**, but scene schema should allow `text_en`, `text_es` fields later.

---

If you confirm this PRD as “good enough to build from,” the next concrete step is:

- Lock tech choices:
  - D1 vs KV,
  - Vanilla JS vs simple framework,
  - Confirm Python or JS for the bot.
- Then I can help draft:
  - A minimal **API contract** (exact JSON request/response for `/api/state`, `/api/choice`), and
  - A starter `scenes/calvin_ch1.json` file matching this spec.