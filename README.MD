# blog-comments-backend

Fastify-based backend API that handles comment functionality for blog posts, with GitHub OAuth, session management and rate-limiting.

## Features

- Add/edit/delete threaded comments
- GitHub OAuth2 login
- Session-based authentication (cookies)
- Rate-limiting per user
- Admin privileges and user bans
- Email notifications via SMTP

## Getting Started

### Prerequisites

- Node.js v18+
- SQLite (via Prisma)
- `config.js` set up (already provided)

**1. Clone this repository**

**2. Configure `config.js`**

**3. Install dependencies**

`npm install`

**4. Run initial DB migration**

`npm run migrate`

**5. Run in development**

`npm start`

## Configuration

Everything is configured in `config.js`:

- `secure`: Set to true for HTTPS in production
- `oauth`: GitHub OAuth credentials
- `smtp`: Email alert config
- `rateLimit`: Cooldown settings
- `adminUsers`: GitHub user IDs allowed to moderate
- `bannedUsers`: GitHub user IDs that are blocked

## API endpoints

### Authentication

---

`GET /auth/login`

Redirect to GitHub OAuth login.

---

`GET /auth/login/callback`

Handle GitHub OAuth callback. Creates/updates user in DB, sets session, and redirects.

---

`POST /api/logout`

Logs out current user.

---

### User

---

`GET /api/me`

Returns data about the currently authenticated user.

- Requires login

Response:

```json
{
  "success": true,
  "data": {
    "githubId": 123,
    "email": "user@example.com",
    "login": "githubLogin",
    "displayName": "John Doe"
  }
}
```

---

### Comments

---

`GET /api/comment/get/:postSlug`

Returns all comments for a given post (threaded).

---

`POST /api/comment/add/:postSlug`

Add new comment or reply to other comment.

- Requires login
- Rate-limited

Body:

```json
{
  "content": "Hello cuties!",
  "replyTo": 123 // optional
}
```

---

`PUT /api/comment/edit/:id`

Edit an existing comment.

- Requires login
- Only author/admin allowed
- Rate-limited

Body:

```json
{
  "content": "New content"
}
```

---

`DELETE /api/comment/delete/:id`

Delete a comment.

- Requires login
- Only author/admin allowed
- Rate-limited

---

## Notes

- Comments must be **20–4000 characters**.
- Max 3 top-level comments per post per user.
- Hidden comments are blank but preserved for threading.
- `adminUsers` bypass limits and can delete others' comments.

## Security

- Cookie-based session with secure flag in production
- OAuth2 with GitHub only
- IP logging for sign-in events

## Emails

- Sends email alerts to `config.commentAlerts` on new comments.