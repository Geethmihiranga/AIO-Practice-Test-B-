# Clientdesk frontend

Vue 3 client-management frontend for the Laravel API described in the Practice Test B brief.

## Run locally

```sh
npm install
Copy-Item .env.example .env
npm run dev
```

## Project structure

```text
src/
├── assets/
│   ├── images/
│   └── scss/
├── components/
├── layouts/
├── Mixins/
├── plugins/
├── router/
├── styles/
├── views/
├── App.vue
└── main.js
```

The router renders the clients view inside the default layout. Shared client formatting lives in `Mixins`, the client API helpers live in `plugins`, and global styles and SCSS tokens are kept in `styles` and `assets/scss`.

Set `VITE_API_BASE_URL` in `.env` to the Laravel API base URL. The default is `http://localhost:8000/api`.

## API contract

The frontend expects these JSON endpoints relative to `VITE_API_BASE_URL`:

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/clients` | List clients |
| `GET` | `/clients?phone=<number>` | Search clients by phone |
| `POST` | `/clients` | Create a client |
| `PUT` | `/clients/{id}` | Update phone, address, and project budget |
| `DELETE` | `/clients/{id}` | Delete a client |

List responses may be an array or a Laravel resource response with a `data` array. Client fields use snake_case: `project_budget`, `service_charge`, `discount_value`, and `final_project_value`. The API remains responsible for calculating service charges, discounts, and final project values. Configure Laravel CORS to allow the frontend origin during local development.
