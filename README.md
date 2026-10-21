# Clientdesk frontend

Vue 3 client-management frontend for the Laravel API described in the Practice Test B brief.

## Run locally

```sh
npm install
Copy-Item .env.example .env
npm run dev
```

Start the Laravel API in a second terminal from
`F:\AIO\New folder\AIO-ITCOURSE0B5Intake01LaravelPracticles`:

```sh
Copy-Item .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8001
```

Create the `client_management` MySQL database and set its credentials in the Laravel `.env` before running migrations. The Vite development server proxies `/api` to `http://127.0.0.1:8001` by default; change `VITE_BACKEND_URL` to use another Laravel server.

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

List responses use a Laravel resource response with a `data` array. Client fields use snake_case: `project_budget`, `employee_count`, `service_charge`, `discount_value`, and `final_project_value`. The API calculates the service charge, employee-count discount, and final project value. A company with exactly 100 employees receives no discount. For production, configure `VITE_API_BASE_URL` and Laravel CORS for your deployment origins.
