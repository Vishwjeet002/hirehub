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

// Middleware
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE,OPTIONS",
    credentials: true,
  })
);
app.use(express.json());

// Ensure uploads folder exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log("📁 uploads folder created");
}
app.use("/uploads", express.static(UPLOAD_DIR));

// Environment variables
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

// DB pool
const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT ? Number(DB_PORT) : 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test DB
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Connected to MySQL");
    conn.release();
  } catch (err) {
    console.error("❌ MySQL test failed:", err.message);
  }
})();

// Multer Storage
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// Safe Error Response Helper
function serverError(res, msg, err) {
  console.error(`❌ ${msg}:`, err.message);
  return res.status(500).json({ error: "Server error" });
}

/*--------------------------------
        ROUTES
--------------------------------*/

// GET ALL JOBS
app.get("/jobs", async (req, res) => {
  try {
    const sql = `
      SELECT
        id,
        position,
        vacancies,
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

// POST CREATE JOB
app.post("/jobs", async (req, res) => {
  try {
    const { position, vacancies, requirements } = req.body;

    if (!position || vacancies === undefined) {
      return res.status(400).json({ error: "position and vacancies required" });
    }

    const sql = `
      INSERT INTO jobs (position, vacancies, filled_positions, requirements)
      VALUES (?, ?, 0, ?)
    `;
    await pool.query(sql, [position, Number(vacancies), requirements]);
    return res.status(201).json({ message: "Job posted successfully" });
  } catch (err) {
    return serverError(res, "POST /jobs", err);
  }
});

// APPLY Job (with resume upload)
app.post("/apply", upload.single("resume"), async (req, res) => {
  try {
    const { job_id, first_name, last_name, email, skills } = req.body;

    if (!job_id || !first_name || !last_name || !email) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Resume required" });
    }

    const resumePath = `/uploads/${req.file.filename}`;
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      const [job] = await conn.query(
        "SELECT vacancies, COALESCE(filled_positions,0) AS filled_positions FROM jobs WHERE id = ? FOR UPDATE",
        [job_id]
      );

      if (!job.length) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ error: "Job not found" });
      }

      const { vacancies, filled_positions } = job[0];

      if (filled_positions >= vacancies) {
        await conn.rollback();
        conn.release();
        return res.status(400).json({ error: "No vacancies left" });
      }

      await conn.query(
        `INSERT INTO applications (job_id, first_name, last_name, email, skills, resume, created_at)
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

// GET APPLICANTS PER JOB
app.get("/applicants/:jobId", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT first_name, last_name, email, skills, resume, created_at 
       FROM applications 
       WHERE job_id = ? 
       ORDER BY id DESC`,
      [req.params.jobId]
    );

    if (!rows.length) {
      return res.json({ message: "No applicants yet" });
    }

    return res.json(rows);
  } catch (err) {
    return serverError(res, "GET /applicants", err);
  }
});

// REGISTER
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, password_hash) VALUES (?, ?)",
      [username, hash]
    );

    return res.json({ message: "User registered" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Username exists" });
    }
    return serverError(res, "POST /register", err);
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const [rows] = await pool.query(
      "SELECT id, username, password_hash FROM users WHERE username=?",
      [username]
    );
    if (!rows.length) return res.status(404).json({ error: "User not found" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
      expiresIn: "1h",
    });

    return res.json({ message: "Login ok", token });
  } catch (err) {
    return serverError(res, "POST /login", err);
  }
});

// ROOT
app.get("/", (req, res) => res.send("✅ Backend Running!"));

// Start server
const serverPort = PORT || 5000;
app.listen(serverPort, () => console.log(`🚀 Running on ${serverPort}`));

//correced code came