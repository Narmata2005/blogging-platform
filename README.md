# Blogging Platform

A full-stack blogging application. Users can register and log in, write and manage blog posts, browse and search posts, and interact with posts using comments and likes.

## Technology

- **Frontend:** React, Vite, React Router, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB with Mongoose
- **Authentication:** JSON Web Tokens (JWT) and bcryptjs password hashing

## Project structure

```text
blogging-platform/
├── backend/
│   ├── controllers/    # Request handling and application logic
│   ├── middleware/     # JWT authentication and auth rate limiting
│   ├── models/         # Mongoose schemas for users, blogs, comments, likes
│   ├── routes/         # Express route definitions
│   ├── server.js       # Express app, middleware, routes, MongoDB connection
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/ # Shared UI, including ProtectedRoute
    │   ├── pages/      # Home, auth, blog, and blog-management pages
    │   ├── services/   # Shared Axios API client
    │   ├── App.jsx     # Client-side routes
    │   └── main.jsx    # React entry point
    └── package.json
```

## Requirements

- Node.js and npm
- A MongoDB database (local MongoDB or MongoDB Atlas)

## Local setup

### 1. Configure the backend

In a terminal, move to the backend folder and install its dependencies:

```powershell
cd blogging-platform\backend
npm install
```

Create `blogging-platform/backend/.env` with these values:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority
JWT_SECRET=<long-random-secret>
FRONTEND_URL=http://localhost:5173
```

Use your actual MongoDB connection URI and a strong, private JWT secret. `FRONTEND_URL` must match the origin serving the frontend; Vite normally uses `http://localhost:5173` during local development.

Start the API:

```powershell
npm run dev
```

The backend listens on `http://localhost:5000`. `npm start` runs it without the nodemon development watcher.

### 2. Configure and start the frontend

Open a second terminal:

```powershell
cd blogging-platform\frontend
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). The frontend API client defaults to `http://localhost:5000/api`. To use a different API URL, set `VITE_API_URL` in `blogging-platform/frontend/.env.local`, for example:

```env
VITE_API_URL=http://localhost:5000/api
```

Restart Vite after changing frontend environment variables.

Environment files are excluded from version control. Never commit database credentials, JWT secrets, or other private tokens.

## Features and routes

### Frontend pages

| Path | Purpose | Access |
|---|---|---|
| `/` | Browse, search, and filter blogs | Public |
| `/register` | Create an account | Public |
| `/login` | Sign in | Public |
| `/blogs/:id` | View a blog, comments, and likes | Public |
| `/create-blog` | Write a blog | Sign-in required |
| `/my-blogs` | Manage your blogs | Sign-in required |
| `/edit-blog/:id` | Edit a blog | Sign-in required; only its author can save changes |

The frontend's `ProtectedRoute` redirects to `/login` when no token is present in local storage. This is a navigation convenience; the backend independently checks JWTs and ownership for protected operations.

### Backend API

All API paths below are relative to `http://localhost:5000`. Protected endpoints require the JWT returned by login to be sent as a bearer token in the `Authorization` request header.

| Method | Path | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register with `username`, `email`, and `password` |
| `POST` | `/api/auth/login` | Public | Sign in with `email` and `password`; returns a JWT and user data |
| `GET` | `/api/blogs` | Public | List blogs; supports `page`, `limit`, `search`, and `category` query parameters |
| `POST` | `/api/blogs` | JWT required | Create a blog with `title`, `content`, `category`, and optional `tags` and `status` |
| `GET` | `/api/blogs/my-blogs` | JWT required | List the signed-in user's blogs |
| `GET` | `/api/blogs/:id` | Public | Fetch a blog by ID |
| `PUT` | `/api/blogs/:id` | JWT and author required | Update supplied blog fields |
| `DELETE` | `/api/blogs/:id` | JWT and author required | Delete a blog and its associated comments and likes |
| `GET` | `/api/blogs/:blogId/comments` | Public | List comments; supports `page` and `limit` |
| `POST` | `/api/blogs/:blogId/comments` | JWT required | Add a comment using `{ "content": "..." }` |
| `DELETE` | `/api/blogs/comments/:commentId` | JWT required | Delete a comment if you wrote it or authored its blog |
| `GET` | `/api/blogs/:blogId/likes` | Optional JWT | Get the like count and, when signed in, your like status |
| `POST` | `/api/blogs/:blogId/like` | JWT required | Like a blog |
| `DELETE` | `/api/blogs/:blogId/like` | JWT required | Remove your like |

Blog listing responses include pagination metadata. The list endpoint defaults to six results per page and caps the requested limit at 50. Comment listing defaults to ten per page and caps the limit at 50.

## Data and validation

- **User:** username, unique email, hashed password, and role (defaults to `USER`).
- **Blog:** title, content, author, category, tags, status (`draft` or `published`), and creation/update timestamps.
- **Comment:** content, author, blog, and timestamps. Content is limited to 1,000 characters.
- **Like:** references a user and blog; a compound unique index prevents a user from liking the same blog more than once.
- Registration requires a username of at least 3 characters, a valid email address, and a password of at least 8 characters.
- Blog creation requires a title of at least 3 characters, content of at least 10 characters, and a category.

## Authentication and security notes

- Passwords are hashed with bcryptjs; login returns a JWT that expires after one day.
- The frontend stores the JWT and user profile in browser local storage and adds the JWT to API requests.
- Authentication endpoints are rate-limited to 10 requests per 15 minutes.
- The backend uses Helmet, restricts CORS to `FRONTEND_URL`, and limits JSON request bodies to 10 KB.
- The backend currently configures Node DNS to use `8.8.8.8` and requests IPv4 for its MongoDB connection.
- **Draft visibility:** the current public blog-list and blog-by-ID handlers do not filter out drafts. The `status` value should therefore not be considered an access-control mechanism.

For deployment, configure the same backend environment variables using the hosting provider's secret/environment settings, set `FRONTEND_URL` to the deployed frontend's exact origin, and set the frontend's `VITE_API_URL` to the deployed API base URL. Do not expose `JWT_SECRET` or `MONGO_URI` in frontend variables.

## Available scripts

Run these commands from their respective `backend` or `frontend` directories:

| Directory | Command | Description |
|---|---|---|
| `backend` | `npm run dev` | Start the API with nodemon |
| `backend` | `npm start` | Start the API with Node.js |
| `frontend` | `npm run dev` | Start the Vite development server |
| `frontend` | `npm run build` | Build the frontend for production |
| `frontend` | `npm run preview` | Preview the production frontend build |
| `frontend` | `npm run lint` | Run ESLint |
