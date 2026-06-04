# NeighborShare

Community resource-sharing platform. React (JS) frontend + Express + MongoDB backend.

---

## Project structure

```
neighborshare/
├── backend/          ← Express API
│   ├── src/
│   │   ├── index.js              ← entry point
│   │   ├── middleware/auth.js    ← JWT protect middleware
│   │   ├── models/               ← Mongoose models
│   │   │   ├── User.js
│   │   │   ├── Item.js
│   │   │   ├── BorrowRequest.js
│   │   │   ├── Review.js
│   │   │   └── Notification.js
│   │   └── routes/               ← Express routers
│   │       ├── auth.js
│   │       ├── items.js
│   │       ├── requests.js
│   │       ├── reviews.js
│   │       └── notifications.js
│   ├── .env.example
│   └── package.json
│
└── frontend/         ← Vite + React (plain JS, no TypeScript)
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   ├── lib/
    │   │   ├── api.js            ← all fetch() calls to backend
    │   │   ├── AppContext.jsx    ← global state + actions
    │   │   └── geo.js            ← Haversine distance helper
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Modal.jsx
    │   │   ├── ItemCard.jsx
    │   │   └── StarRating.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── BrowsePage.jsx
    │   │   ├── ItemDetailPage.jsx
    │   │   ├── MyItemsPage.jsx
    │   │   ├── RequestsPage.jsx
    │   │   └── ProfilePage.jsx
    │   └── utils/cn.js
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Setup

### 1. MongoDB
Make sure MongoDB is running locally:
```bash
mongod
# default: mongodb://localhost:27017
```
Or use a free MongoDB Atlas cluster and paste the URI into `.env`.

### 2. Backend
```bash
cd backend
cp .env.example .env        # edit MONGO_URI and JWT_SECRET
npm install
npm run dev                 # runs on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev                 # runs on http://localhost:5173
```

Vite proxies `/api/*` → `http://localhost:5000` automatically (configured in `vite.config.js`).

---

## API reference

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/signup | ✗ | Register new user |
| POST | /api/auth/login | ✗ | Login, returns JWT |
| GET | /api/auth/me | ✓ | Get current user |
| GET | /api/items | ✓ | All items (owner populated) |
| GET | /api/items/mine | ✓ | Current user's items only |
| GET | /api/items/:id | ✓ | Single item |
| POST | /api/items | ✓ | Create item |
| DELETE | /api/items/:id | ✓ | Delete own item |
| GET | /api/requests | ✓ | Requests involving current user |
| POST | /api/requests | ✓ | Create borrow request |
| PATCH | /api/requests/:id/approve | ✓ | Owner approves |
| PATCH | /api/requests/:id/reject | ✓ | Owner rejects |
| PATCH | /api/requests/:id/cancel | ✓ | Borrower cancels |
| PATCH | /api/requests/:id/return | ✓ | Mark returned |
| GET | /api/reviews/user/:userId | ✓ | Reviews for a user |
| GET | /api/reviews/request/:requestId | ✓ | Reviews for a request |
| POST | /api/reviews | ✓ | Submit review |
| GET | /api/notifications | ✓ | Current user's notifications |
| PATCH | /api/notifications/read-all | ✓ | Mark all read |

All protected routes require `Authorization: Bearer <token>` header.

---

## Key differences from the original TypeScript version

- All `.tsx` → `.jsx`, all `.ts` → `.js`
- No TypeScript types, interfaces, or generics anywhere
- No demo/seed users — real signup/login via MongoDB
- `localStorage` DB replaced with Express + Mongoose backend
- JWT stored in `localStorage` as `ns_token`
- MongoDB `_id` used everywhere instead of custom `id`
- `AppContext` now holds `items`, `requests`, `notifications` as separate state arrays fetched from the API
