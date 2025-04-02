import express from 'express';
import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Convert import.meta.url to __dirname equivalent (for ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static files from the `public` directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(express.json());
app.use(cors());

// PostgreSQL Connection
const { Pool } = pg;

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  password: String(process.env.POSTGRES_PASS),
  port: process.env.POSTGRES_PORT || 5432,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => console.log("✅ Connected to Database"))
  .catch(err => console.error("❌ Database Connection Error:", err));

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// 🚀 **Register Endpoint**
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const userExists = await pool.query(
      'SELECT id FROM authentication.users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO authentication.users (username, email, password_hash, created_at) 
       VALUES ($1, $2, $3, NOW()) RETURNING id`,
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });

  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 🚀 **Login Endpoint**
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const user = await pool.query(
      'SELECT id, username, password_hash FROM authentication.users WHERE email = $1',
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.rows[0].id, username: user.rows[0].username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ Protected route - Dashboard
app.get('/dashboard', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ✅ Serve `index.html` as the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

app.get('/api/weddings', authenticateToken, async (req, res) => {
  try {
      const result = await pool.query("SELECT id, feature, description FROM content.weddings ORDER BY id ASC"); // ✅ Fixed Query
      res.json(result.rows);
  } catch (error) {
      console.error("Error fetching weddings:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/api/events', authenticateToken, async (req, res) => {
  try {
      const result = await pool.query("SELECT id, event_type, description FROM content.events ORDER BY id ASC"); // ✅ Fixed Query
      res.json(result.rows);
  } catch (error) {
      console.error("Error fetching weddings:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});

