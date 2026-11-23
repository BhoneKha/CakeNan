const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Load settings from .env if it exists (Node 20.12+)
try { process.loadEnvFile(path.join(__dirname, '.env')); } catch { /* no .env file */ }

const MENU = require('./public/js/menu.js');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';

const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]');

const menuById = new Map(MENU.map(cake => [cake.id, cake]));

const ORDER_STATUSES = ['pending', 'confirmed', 'ready', 'completed', 'cancelled'];
const FULFILLMENT_TYPES = ['delivery', 'pickup'];
const PAYMENT_METHODS = ['qr', 'cod'];

// ── Admin login (HTTP Basic Auth) ─────────────────────────
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function requireAdmin(req, res, next) {
  if (!ADMIN_PASSWORD) {
    return res.status(503).send('Admin is disabled. Set ADMIN_PASSWORD in your .env file.');
  }
  const [scheme, encoded] = (req.headers.authorization || '').split(' ');
  if (scheme === 'Basic' && encoded) {
    const decoded = Buffer.from(encoded, 'base64').toString();
    const sep = decoded.indexOf(':');
    const user = decoded.slice(0, sep);
    const pass = decoded.slice(sep + 1);
    if (sep !== -1 && safeEqual(user, ADMIN_USER) && safeEqual(pass, ADMIN_PASSWORD)) {
      return next();
    }
  }
  res.set('WWW-Authenticate', 'Basic realm="Cake Nan Admin", charset="UTF-8"');
  res.status(401).send('Login required');
}

// ── Middleware ────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
// Payment slips contain customer bank details, so only the admin can view them
app.use('/uploads', requireAdmin, express.static(UPLOADS_DIR));

// ── Slip uploads ──────────────────────────────────────────
// The file extension comes from the image type, not the customer's file name,
// so nobody can upload an .html or .js file disguised as an image.
const IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/heic': '.heic',
  'image/heif': '.heif'
};

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOADS_DIR,
    filename: (req, file, cb) => {
      cb(null, `slip-${Date.now()}-${crypto.randomBytes(4).toString('hex')}${IMAGE_TYPES[file.mimetype]}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    if (IMAGE_TYPES[file.mimetype]) cb(null, true);
    else cb(new Error('Please upload a JPG, PNG, WEBP or HEIC image'));
  }
});

// ── Helpers ───────────────────────────────────────────────
function readOrders() {
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  // Write to a temp file first so a crash mid-write can't corrupt the orders
  const tmp = ORDERS_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(orders, null, 2));
  fs.renameSync(tmp, ORDERS_FILE);
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

// Rebuild the cart from the menu so prices always come from the server,
// not from whatever the browser sent.
function buildItems(rawCart) {
  let cart;
  try {
    cart = JSON.parse(rawCart);
  } catch {
    return null;
  }
  if (!Array.isArray(cart) || cart.length === 0 || cart.length > 50) return null;

  const items = [];
  for (const entry of cart) {
    const cake = menuById.get(Number(entry.id));
    const quantity = Number(entry.quantity);
    if (!cake || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) return null;
    items.push({ id: cake.id, name: cake.name, price: cake.price, quantity });
  }
  return items;
}

function removeUpload(file) {
  if (file) fs.unlink(file.path, () => {});
}

// ── Public routes ─────────────────────────────────────────

// Place a new order (multipart form, with an optional payment slip)
app.post('/api/orders', upload.single('slip'), (req, res) => {
  const fail = (status, message) => {
    removeUpload(req.file);
    res.status(status).json({ success: false, message });
  };

  try {
    const name = cleanText(req.body.name, 100);
    const phone = cleanText(req.body.phone, 30);
    const address = cleanText(req.body.address, 500);
    const notes = cleanText(req.body.notes, 500);
    const fulfillment = req.body.fulfillment || 'delivery';
    const paymentMethod = req.body.paymentMethod || 'cod';

    if (!name || !phone) return fail(400, 'Please enter your name and phone number');
    if (!FULFILLMENT_TYPES.includes(fulfillment)) return fail(400, 'Invalid order method');
    if (!PAYMENT_METHODS.includes(paymentMethod)) return fail(400, 'Invalid payment method');
    if (fulfillment === 'delivery' && !address) return fail(400, 'Delivery address is required');
    if (paymentMethod === 'qr' && !req.file) return fail(400, 'Payment slip is required for QR payment');

    const items = buildItems(req.body.cartItems);
    if (!items) return fail(400, 'Your cart has an item we could not find. Please refresh the page and try again.');

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const now = new Date().toISOString();

    const order = {
      id: crypto.randomUUID(),
      orderNumber: `CN-${Date.now()}`,
      status: 'pending',
      fulfillment,
      customer: {
        name,
        phone,
        address: fulfillment === 'pickup' ? 'Store Pickup' : address
      },
      payment: {
        method: paymentMethod,
        slipFile: req.file ? req.file.filename : null,
        slipUrl: req.file ? `/uploads/${req.file.filename}` : null,
        verified: paymentMethod === 'cod' ? null : false // null = not needed, false = waiting, true = checked
      },
      items,
      total,
      notes,
      createdAt: now,
      updatedAt: now
    };

    const orders = readOrders();
    orders.unshift(order);
    writeOrders(orders);

    console.log(`New order ${order.orderNumber} | ${order.customer.name} | ฿${order.total} | ${order.fulfillment} | ${order.payment.method}`);

    res.json({
      success: true,
      message: 'Order placed successfully',
      order: { id: order.id, orderNumber: order.orderNumber, total: order.total }
    });
  } catch (err) {
    console.error('Order error:', err);
    removeUpload(req.file);
    res.status(500).json({ success: false, message: 'Something went wrong on our side' });
  }
});

// ── Admin routes ──────────────────────────────────────────

app.get('/admin', requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/api/orders', requireAdmin, (req, res) => {
  res.json({ success: true, orders: readOrders() });
});

app.get('/api/orders/:id', requireAdmin, (req, res) => {
  const order = readOrders().find(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
});

app.patch('/api/orders/:id/status', requireAdmin, (req, res) => {
  const { status } = req.body;
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  const orders = readOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.status = status;
  order.updatedAt = new Date().toISOString();
  writeOrders(orders);

  console.log(`Order ${order.orderNumber} -> ${status}`);
  res.json({ success: true, order });
});

app.patch('/api/orders/:id/verify-payment', requireAdmin, (req, res) => {
  const orders = readOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.payment.method !== 'qr') {
    return res.status(400).json({ success: false, message: 'Only QR payments need verifying' });
  }

  order.payment.verified = req.body.verified === true;
  order.updatedAt = new Date().toISOString();
  writeOrders(orders);

  res.json({ success: true, order });
});

app.delete('/api/orders/:id', requireAdmin, (req, res) => {
  const orders = readOrders();
  const idx = orders.findIndex(o => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Order not found' });

  const [deleted] = orders.splice(idx, 1);
  writeOrders(orders);
  if (deleted.payment.slipFile) {
    fs.unlink(path.join(UPLOADS_DIR, path.basename(deleted.payment.slipFile)), () => {});
  }

  console.log(`Deleted order ${deleted.orderNumber}`);
  res.json({ success: true, message: 'Order deleted' });
});

// Turn upload errors (wrong file type, too big) into a clear JSON message
app.use((err, req, res, next) => {
  removeUpload(req.file);
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'The slip image must be under 10 MB' });
  }
  if (err) {
    return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
  }
  next();
});

app.listen(PORT, () => {
  console.log(`\nCake Nan is running`);
  console.log(`  Website : http://localhost:${PORT}`);
  console.log(`  Admin   : http://localhost:${PORT}/admin`);
  if (!ADMIN_PASSWORD) {
    console.log(`\n  Warning: ADMIN_PASSWORD is not set, so the admin page is locked.`);
    console.log(`  Copy .env.example to .env and choose a password.\n`);
  }
});
