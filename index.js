import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";

dotenv.config();
const app = express();

/* =============================
        CORS CONFIG
=============================*/
app.use(
  cors({
    origin: [
      "https://your-frontend-url.vercel.app", // ✅ <-- Replace with your real frontend
      "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.options("*", cors()); // ✅ Fixes preflight

app.use(express.json());

/* =============================
        UPLOAD SETUP
=============================*/
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

app.use("/uploads", express.static(UPLOAD_DIR));

/* =============================
        ENV VARIABLES
=============================*/
const {
  DB_HOST,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_PORT,
  JWT_SECRET,
  PORT,
} = process.env;

const SECRET_KEY = JWT_SECRET || "fallback_secret_key";

/* =============================
        MYSQL POOL
=============================*/
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT ? Number(DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: { rejectUnauthorized: false },
});

/* =============================
        DB CHECK
=============================*/
(async () => {
  try {
    const c = await pool.getConnection();
    console.log("✅ Connected to MySQL");
    c.release();
  } catch (err) {
    console.error("❌ DB connect error:", err.message);
  }
})();

/* =============================
        FILE STORAGE
=============================*/
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

/* =============================
        ERROR HELPER
=============================*/
function serverError(res, msg, err) {
  console.error(`❌ ${msg}:`, err.message);
  return res.status(500).json({ error: "Server error" });
}

/* =============================
        ROUTES
=============================*/

app.get("/health", (req, res) => res.status(200).send("OK"));

app.get("/jobs", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, position, vacancies,
      COALESCE(filled_positions, 0) AS filled_positions,
      (vacancies - COALESCE(filled_positions, 0)) AS remaining_vacancies,
      requirements,
      created_at
      FROM jobs
      ORDER BY id DESC
    `);

    return res.json(rows);
  } catch (err) {
    return serverError(res, "GET /jobs", err);
  }
});

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

app.post("/apply", upload.single("resume"), async (req, res) => {
  try {
    const { job_id, first_name, last_name, email, skills } = req.body;

    const resumePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [job] = await conn.query(
        "SELECT vacancies, COALESCE(filled_positions,0) AS filled_positions FROM jobs WHERE id = ? FOR UPDATE",
        [job_id]
      );

      if (!job.length) return res.status(404).json({ error: "Job not found" });

      const { vacancies, filled_positions } = job[0];
      if (filled_positions >= vacancies)
        return res.status(400).json({ error: "No vacancies left" });

      await conn.query(
        `INSERT INTO applications(job_id, first_name, last_name, email, skills, resume, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [job_id, first_name, last_name, email, skills, resumePath]
      );

      await conn.query(
        `UPDATE jobs SET filled_positions = filled_positions + 1 WHERE id = ?`,
        [job_id]
      );

      await conn.commit();
      conn.release();

      return res.json({ message: "Application submitted" });
    } catch (txErr) {
      await conn.rollback();
      conn.release();
      throw txErr;
    }
  } catch (err) {
    return serverError(res, "POST /apply", err);
  }
});

app.get("/applicants/:jobId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT first_name, last_name, email, skills, resume
       FROM applications WHERE job_id = ? ORDER BY id DESC`,
      [req.params.jobId]
    );

    return res.json(rows);
  } catch (err) {
    return serverError(res, "GET /applicants", err);
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users(username, password_hash, created_at) VALUES(?, ?, NOW())",
      [username, hash]
    );

    res.json({ message: "User registered" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ error: "Username exists" });

    return serverError(res, "POST /register", err);
  }
});

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

    res.json({ message: "Logged in", token });
  } catch (err) {
    return serverError(res, "POST /login", err);
  }
});

app.get("/", (req, res) => {
  res.send("✅ Backend Running!");
});

/* =============================
        START SERVER (LOCAL)
=============================*/
if (process.env.NODE_ENV !== "production") {
  const serverPort = PORT || 5000;
  app.listen(serverPort, "0.0.0.0", () => {
    console.log(`🚀 Server running on ${serverPort}`);
  });
}

// ✅ Required For Vercel:
export default app;
