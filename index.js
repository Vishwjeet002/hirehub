import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();
const app = express();

/* ===========================
       ✅ CORS CONFIG
=========================== */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// extra fallback headers (important)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,DELETE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type,Authorization"
  );
  next();
});

app.use(express.json());

/* ===========================
       ✅ UPLOAD SETUP
=========================== */
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
app.use("/uploads", express.static(UPLOAD_DIR));

const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  JWT_SECRET,
  PORT
} = process.env;

const SECRET_KEY = JWT_SECRET || "fallback_secret_key";

/* ===========================
       ✅ MYSQL POOL
=========================== */
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT ? Number(DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false }
});

/* ===========================
       ✅ TEST CONNECTION
=========================== */
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Connected to MySQL");
    conn.release();
  } catch (err) {
    console.error("❌ DB connection failed:", err.message);
  }
})();

/* ===========================
       ✅ MULTER SETUP
=========================== */
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

function serverError(res, msg, err) {
  console.error(`❌ ${msg}:`, err.message);
  return res.status(500).json({ error: "Server error" });
}

/* ===========================
           ROUTES
=========================== */

// Health Check (Render uses this)
app.get("/health", (req, res) => res.status(200).send("OK"));

// ✅ GET JOBS
app.get("/jobs", async (req, res) => {
  try {
    const sql = `
      SELECT id, position, vacancies,
      COALESCE(filled_positions, 0) AS filled_positions,
      (vacancies - COALESCE(filled_positions, 0)) AS remaining_vacancies,
      requirements,
      created_at
      FROM jobs
      ORDER BY id DESC
    `;
    const [rows] = await pool.query(sql);
    return res.json(rows);
  } catch (err) {
    return serverError(res, "GET /jobs", err);
  }
});

// ✅ POST JOB
app.post("/jobs", async (req, res) => {
  try {
    const { position, vacancies, requirements } = req.body;

    await pool.query(
      `INSERT INTO jobs(position, vacancies, filled_positions, requirements, created_at)
       VALUES (?, ?, 0, ?, NOW())`,
      [position, vacancies, requirements]
    );

    return res.status(201).json({ message: "Job posted successfully" });
  } catch (err) {
    return serverError(res, "POST /jobs", err);
  }
});

// ✅ APPLY
app.post("/apply/:jobId", upload.single("resume"), async (req, res) => {
  try {
    const { jobId } = req.params; // Get from URL params
    const { first_name, last_name, email, skills } = req.body;

    const resumePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    
    // Rest of your code using jobId instead of job_id
    const [job] = await conn.query(
      "SELECT vacancies, COALESCE(filled_positions,0) AS filled_positions FROM jobs WHERE id = ? FOR UPDATE",
      [jobId] // Use jobId here
    );
    
    // ... rest of your code
  } catch (err) {
    return serverError(res, "POST /apply/:jobId", err);
  }
});// ✅ GET APPLICANTS
app.get("/applicants/:jobId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT first_name, last_name, email, skills, resume, created_at
       FROM applications
       WHERE job_id = ?
       ORDER BY id DESC`,
      [req.params.jobId]
    );
    return res.json(rows);
  } catch (err) {
    return serverError(res, "GET /applicants", err);
  }
});

// ✅ REGISTER
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users(username, password_hash, created_at) VALUES(?, ?, NOW())",
      [username, hash]
    );

    return res.json({ message: "User registered" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Username exists" });

    return serverError(res, "POST /register", err);
  }
});

// ✅ LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      "SELECT id, username, password_hash FROM users WHERE username=?",
      [username]
    );

    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const match = await bcrypt.compare(password, rows[0].password_hash);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ id: rows[0].id }, SECRET_KEY, { expiresIn: "2h" });
    return res.json({ message: "Logged in", token });
  } catch (err) {
    return serverError(res, "POST /login", err);
  }
});

// ✅ ROOT
app.get("/", (req, res) => res.send("✅ Backend Running!"));

// ✅ RUN SERVER FOR RENDER
const serverPort = PORT ? Number(PORT) : 5000;
app.listen(serverPort, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${serverPort}`);
});
