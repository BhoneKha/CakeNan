# Cake Nan

The ordering website for Cake Nan, a small home bakery on Mahawong Road in Nan, Thailand.

Customers can browse the menu, add cakes to a cart and check out. They pick delivery or store pickup and pay by PromptPay QR or cash. Orders go to a simple admin dashboard where we confirm payments and track each order until it is collected or delivered.

## Features

**Website**
- Menu with search and category filter
- Cart that is saved in the browser
- Delivery or store pickup
- PromptPay QR code generated with the exact amount, plus payment slip upload
- Cash on delivery, or pay at the store for pickup orders
- Store location, opening hours and contact links (LINE, Facebook, Instagram)

**Admin dashboard** (`/admin`)
- Today's revenue and order counts at a glance
- Search by name, phone or order number, and filter by status
- View payment slips and mark them as checked
- Move orders through `pending → confirmed → ready → completed` (or `cancelled`)
- Refreshes every 30 seconds

## Running it

You need Node.js 20.12 or newer.

```bash
npm install
cp .env.example .env    # then set ADMIN_PASSWORD
npm start
```

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin (log in with `ADMIN_USER` / `ADMIN_PASSWORD` from `.env`)

The admin page stays locked until `ADMIN_PASSWORD` is set.

During development, `npm run dev` restarts the server whenever a file changes.

## Project layout

```
server.js            Express server and API
public/
  index.html         Customer website
  js/menu.js         Cake menu and prices, shared with the server
views/
  admin.html         Admin dashboard (served only after login)
data/orders.json     Orders (created automatically, not in git)
uploads/             Payment slips (created automatically, not in git)
```

## Updating the menu

All cakes live in `public/js/menu.js`. The server reads its prices from the same file, so totals are always calculated from the real prices and not from whatever the browser sends.

## API

| Method | Endpoint | Access | What it does |
|--------|----------|--------|--------------|
| `POST` | `/api/orders` | Public | Place an order (multipart form, `slip` image optional) |
| `GET` | `/api/orders` | Admin | List all orders, newest first |
| `GET` | `/api/orders/:id` | Admin | Get one order by ID or order number |
| `PATCH` | `/api/orders/:id/status` | Admin | Change the order status |
| `PATCH` | `/api/orders/:id/verify-payment` | Admin | Mark a QR payment as checked |
| `DELETE` | `/api/orders/:id` | Admin | Delete an order and its slip |

## Notes

- Orders are kept in a JSON file. That is plenty for a small shop, but switch to a real database before taking a large number of orders.
- Payment slips include customers' bank details, so only a logged-in admin can open them. Back up `data/` and `uploads/` regularly.
- When you put the site online, run it over HTTPS. Admin logins are sent with every request.
- For a long-running server, a process manager such as PM2 keeps it up: `pm2 start server.js --name cakenan`.
