
# 📦 Mobo Deal Bot — Backend

Real-time Telegram deals ingestion + AI-powered shopping assistant backend.

This service listens to **Telegram deal channels**, parses product information (price, platform, links), stores them in MongoDB, and exposes REST APIs for **Auth, Products, Orders, and Chat (Gemini)**.

---

## 🚀 Tech Stack

| Layer    | Tech                                            |
| -------- | ----------------------------------------------- |
| Runtime  | Node.js (TypeScript, ESM)                       |
| API      | Express.js                                      |
| Database | MongoDB + Mongoose                              |
| Telegram | `telegram` SDK (GramJS)                         |
| AI Chat  | Gemini (`gemini-2.5-flash`) via `@google/genai` |
| Auth     | JWT + bcrypt                                    |
| Security | Helmet, CORS, Rate Limiting, Morgan Logging     |

---

## 📂 Project Structure

```
src/
 ├─ server.ts               # Express entry
 ├─ config/
 │   ├─ env.ts              # zod-validated environment variables
 │   └─ db.ts               # MongoDB connect
 ├─ routes/                 # Auth, Products, Orders, Chat API
 ├─ models/                 # User, Product, Order, Chat schemas
 ├─ types.ts                # Shared interfaces/enums
 ├─ telegram/
 │   ├─ auth.ts             # Get TG_SESSION token
 │   ├─ listener.ts         # Real-time Telegram listener
 │   └─ parser.ts           # Multi-deal message parser
 ├─ middleware/             # auth + error handler
```

---

## 🔐 Environment Variables

Create `.env`:

```env
# Mongo
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB=mobo_deal_bot

# Auth
JWT_SECRET=your-jwt-secret

# AI
OPENAI_API_KEY=your-gemini-key

# Server
PORT=4000
CORS_ORIGIN=http://localhost:3000

# Telegram API Credentials
TG_API_ID=123456
TG_API_HASH=abcdef123456789
TG_SESSION=string_from_auth_script

# Telegram Channels to watch (comma separated)
TG_CHANNELS=@iamprasadtech,@techfactsdeals
```

> ⚠️ `TG_SESSION` is generated using `npm run auth`

---

## 📦 Installation

```sh
npm install
```

---

## ▶️ Running the Backend API

```sh
npm run dev
```


---

## 🤖 Telegram Listener (Deals Ingestion)

Prerequisites:

✔ Join the channels listed in `.env`

✔ Correct API ID/Hash in `.env`

✔ `TG_SESSION` must be valid

Run:

```sh
npm run listener
```

This will:

* Connect to Telegram
* Sync dialogs
* Listen for **new deal messages**
* Parse **multiple products per message**
* Download image (if attached) → base64 fallback otherwise
* Upsert into MongoDB

---

## 🧠 Gemini AI Chat Flow

The FE sends:

```json
POST /api/chat
{
  "message": "Show Amazon headphone deals",
  "userId": "123",
  "userName": "Mani"
}
```

Backend:

✔ Fetches products + orders

✔ Sends to Gemini with structured system prompt

✔ Classifies intent

✔ Returns recommendations + order lookup suggestions

✔ Saves chat history

---

## 🧩 API Reference

| Method | Endpoint              | Description         |
| ------ | --------------------- | ------------------- |
| GET    | `/api/health`         | Service status      |
| POST   | `/api/auth/register`  | Sign-up             |
| POST   | `/api/auth/login`     | Sign-in → JWT       |
| GET    | `/api/products`       | List all deals      |
| GET    | `/api/products/:id`   | Product details     |
| POST   | `/api/products/bulk`  | Get products by IDs |
| POST   | `/api/orders`         | Create order        |
| GET    | `/api/orders/:userId` | User order history  |
| POST   | `/api/chat`           | AI shopping chat    |

---

## 🔄 Data Flow

```
Telegram Channel → listener.ts → parseDeals.ts → MongoDB → REST APIs → Frontend UI
```

📌 Multi-link message support = multiple products stored per post

📌 Image extraction from Telegram messages supported

📌 Deduplicated using product ID (affiliate link)

---

## 🛡 Security

✔ JWT-protected routes (auth middleware)

✔ Helmet

✔ CORS (configurable origin)

✔ Rate-limit: **100 req/min/IP**

✔ Password hashing with bcrypt

---

## 🧪 Quick Start (Local Development)

```sh
# 1️⃣ Login to Telegram and get TG_SESSION
npm run auth

# 2️⃣ Start API
npm run dev

# 3️⃣ Start listener in separate terminal
npm run listener
```

---

## 📌 Notes

* `listener.ts` is a **long-running worker**, not part of HTTP server
* Both API + listener use the same `.env` and database
* Dates stored as ISO strings
* Products parsed only if they contain a buy link (`https://...`)


