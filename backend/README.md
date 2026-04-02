# Backend (PocketBase embedded)

This backend runs an embedded PocketBase instance (Go). It provides the database, REST API and realtime features.

Quick start:

1. Install Go (>= 1.20).
2. Masuk `backend` folder, run:

```bash
go mod tidy
go run main.go
```

PocketBase will start on port `8090`.

Admin UI: http://localhost:8090/_/

Notes:
- Use the Admin UI to create collections such as `complaints` and `chats` (see exported JSON if you want to import).
- The built-in Realtime API can be used by the frontend (PocketBase JS client) to subscribe to changes and implement chat in real time.

## Authentication & chat schema

PocketBase automatically provides the `users` auth collection. You can create a user with the Admin UI (set `isAdmin` flag for admin accounts) or register from the frontend.

The exported JSON includes a `chats` collection whose schema includes relations to the users collection (`sender` and optional `recipient`). Messages are filtered in the frontend so users only see their own conversation; admins can view all and reply.

If you want a starting admin account, open the Admin UI and add a user, then toggle the **Admin** switch on that user record.

# Import data

To import the provided schema/sample data, go to **Settings → Import data** in the Admin UI and select `pb_export.json` (or `pb_export_fixed.json`). This will create the `complaints` and `chats` collections with the correct fields.
