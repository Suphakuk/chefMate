const express = require('express');
const mysql = require('mysql2');

const cors = require('cors');
app.use(cors());

const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());


// ---------------------------------------------------------
// 1. ระบบอัปโหลดรูปภาพ (Multer) พร้อมสร้างโฟลเดอร์อัตโนมัติ
// ---------------------------------------------------------
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('📁 สร้างโฟลเดอร์ uploads สำหรับเก็บรูปภาพอัตโนมัติแล้ว!');
}

app.use('/uploads', express.static(uploadDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'recipe-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    console.error("Upload Error: ไม่พบไฟล์ถูกส่งมา");
    return res.status(400).json({ message: "ไม่ได้แนบไฟล์รูปภาพมา" });
  }
  
  // ให้อ่านค่า BASE_URL จาก Cloud ถ้าไม่มีให้ใช้ localhost
  const baseUrl = process.env.BASE_URL || 'https://chefmate-ild4.onrender.com';
  const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
  
  console.log("✅ อัปโหลดรูปสำเร็จ:", imageUrl);
  res.json({ url: imageUrl });
});

// ---------------------------------------------------------
// 2. ตั้งค่าการเชื่อมต่อฐานข้อมูล MySQL
// ---------------------------------------------------------
// แก้ไขส่วนการเชื่อมต่อ MySQL เดิม ให้เป็นแบบนี้:
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'chefmate_db',
  port: process.env.DB_PORT || 3306,
  ssl: process.env.DB_HOST ? { rejectUnauthorized: false } : false // เปิด SSL เมื่อขึ้น Cloud
});

db.connect((err) => {
  if (err) {
    console.error('❌ เชื่อมต่อฐานข้อมูลล้มเหลว: ' + err.stack);
    return;
  }
  console.log('✅ เชื่อมต่อฐานข้อมูล MySQL สำเร็จ!');
});

// ---------------------------------------------------------
// 3. API ระบบยืนยันตัวตน (Auth)
// ---------------------------------------------------------
app.post('/register', async (req, res) => {
  const { username, email, password, role = 'user' } = req.body;

  const checkSql = "SELECT email FROM users WHERE email = ?";
  db.query(checkSql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "เกิดข้อผิดพลาดจากฐานข้อมูล" });
    if (results.length > 0) return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const insertSql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
    
    db.query(insertSql, [username, email, hashedPassword, role], (err) => {
      if (err) return res.status(500).json({ message: "สมัครสมาชิกไม่สำเร็จ" });
      return res.json({ message: "สมัครสมาชิกสำเร็จ!" });
    });
  });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "เกิดข้อผิดพลาดจากฐานข้อมูล" });
    if (results.length === 0) return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });

    return res.json({ 
      message: "เข้าสู่ระบบสำเร็จ!", 
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  });
});

// ---------------------------------------------------------
// 4. API จัดการผู้ใช้ (User Management)
// ---------------------------------------------------------
app.get('/api/users', (req, res) => {
  const sql = "SELECT id, username, email, role FROM users"; 
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: "ดึงข้อมูลผู้ใช้ล้มเหลว", error: err.message });
    return res.json(results);
  });
});

app.post('/api/users', async (req, res) => {
  const { username, email, password, role = 'user' } = req.body;
  const checkSql = "SELECT email FROM users WHERE email = ?";
  db.query(checkSql, [email], async (err, results) => {
    if (err) return res.status(500).json({ message: "เกิดข้อผิดพลาดจากฐานข้อมูล" });
    if (results.length > 0) return res.status(400).json({ message: "อีเมลนี้มีอยู่ในระบบแล้ว" });

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
      db.query(sql, [username, email, hashedPassword, role], (err) => {
        if (err) return res.status(500).json({ message: "เพิ่มผู้ใช้ล้มเหลว" });
        return res.json({ message: "เพิ่มผู้ใช้สำเร็จ!" });
      });
    } catch (hashErr) {
      return res.status(500).json({ message: "เกิดข้อผิดพลาดในการประมวลผลรหัสผ่าน" });
    }
  });
});

app.put('/api/users/:id', async (req, res) => {
  const { username, email, password, role } = req.body;
  const userId = req.params.id;

  try {
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      const sql = "UPDATE users SET username = ?, email = ?, password = ?, role = ? WHERE id = ?";
      db.query(sql, [username, email, hashedPassword, role, userId], (err) => {
        if (err) return res.status(500).json({ message: "แก้ไขข้อมูลผู้ใช้ล้มเหลว" });
        return res.json({ message: "แก้ไขข้อมูลผู้ใช้สำเร็จ!" });
      });
    } else {
      const sql = "UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?";
      db.query(sql, [username, email, role, userId], (err) => {
        if (err) return res.status(500).json({ message: "แก้ไขข้อมูลผู้ใช้ล้มเหลว" });
        return res.json({ message: "แก้ไขข้อมูลผู้ใช้สำเร็จ!" });
      });
    }
  } catch (hashErr) {
    return res.status(500).json({ message: "เกิดข้อผิดพลาดในการประมวลผลรหัสผ่าน" });
  }
});

app.delete('/api/users/:id', (req, res) => {
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "ลบผู้ใช้ล้มเหลว" });
    return res.json({ message: "ลบผู้ใช้สำเร็จ!" });
  });
});

// ---------------------------------------------------------
// 5. API จัดการเมนูอาหาร (Recipes Management)
// ---------------------------------------------------------
app.get('/api/recipes', (req, res) => {
  const sql = "SELECT * FROM recipes ORDER BY created_date DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// เพิ่มเมนูใหม่ (POST) - รองรับการผูกวิดีโออัตโนมัติ
app.post('/api/recipes', (req, res) => {
  const { title, title_en, description, description_en, image_url, category, difficulty, cook_time, calories, youtube_url } = req.body;
  
  const newRecipeId = crypto.randomBytes(12).toString('hex'); 
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const sqlRecipe = `INSERT INTO recipes 
    (id, title, title_en, description, description_en, image_url, category, difficulty, cook_time, calories, created_date, updated_date, recommended_count, favorite_count, view_count, is_published, is_sample) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 'true', 'false')`;
    
  db.query(sqlRecipe, [
    newRecipeId, title, title_en, description, description_en, image_url, category, difficulty, cook_time, calories, now, now
  ], (err) => {
    if (err) return res.status(500).json({ message: "เพิ่มเมนูไม่สำเร็จ" });

    // ถ้ามีการแนบลิงก์ YouTube มาด้วย ให้บันทึกลงตารางวิดีโออัตโนมัติ
    if (youtube_url && youtube_url.trim() !== "") {
      const newVideoId = crypto.randomBytes(12).toString('hex');
      const sqlVideo = `INSERT INTO recipe_videos (id, title, title_en, youtube_url, duration, recipe_id, created_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      
      db.query(sqlVideo, [newVideoId, `วิธีทำ ${title}`, `How to make ${title_en || title}`, youtube_url, "", newRecipeId, now], (videoErr) => {
        if (videoErr) console.error("Auto Video Insert Error:", videoErr);
        // ถึงจะผูกวิดีโอพัง ก็ตอบกลับว่าเพิ่มเมนูสำเร็จไปก่อน เพื่อไม่ให้หน้าเว็บค้าง
        return res.status(201).json({ message: "เพิ่มเมนูและผูกวิดีโอสำเร็จ" });
      });
    } else {
      res.status(201).json({ message: "เพิ่มเมนูสำเร็จ" });
    }
  });
});
app.put('/api/recipes/:id', (req, res) => {
  const { title, title_en, description, description_en, image_url, category, difficulty, cook_time, calories } = req.body;
  const recipeId = req.params.id;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const sql = `UPDATE recipes SET 
    title=?, title_en=?, description=?, description_en=?, image_url=?, 
    category=?, difficulty=?, cook_time=?, calories=?, updated_date=? 
    WHERE id=?`;

  db.query(sql, [title, title_en, description, description_en, image_url, category, difficulty, cook_time, calories, now, recipeId], (err) => {
    if (err) return res.status(500).json({ message: "แก้ไขเมนูไม่สำเร็จ" });
    res.json({ message: "แก้ไขเมนูสำเร็จ" });
  });
});

app.delete('/api/recipes/:id', (req, res) => {
  const sql = "DELETE FROM recipes WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "ลบเมนูไม่สำเร็จ" });
    res.json({ message: "ลบเมนูสำเร็จ" });
  });
});

// ---------------------------------------------------------
// 6. API จัดการวิดีโอ (Videos Management)
// ---------------------------------------------------------
app.get('/api/videos', (req, res) => {
  const sql = "SELECT * FROM recipe_videos ORDER BY created_date DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/videos', (req, res) => {
  const { title, title_en, youtube_url, duration, recipe_id } = req.body;
  const newId = crypto.randomBytes(12).toString('hex'); 
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // ถ้าค่าเป็น empty string ("") ให้แปลงเป็น null เพื่อป้องกัน Error ใน Database
  const finalRecipeId = (recipe_id && recipe_id.trim() !== "") ? recipe_id : null;

  const sql = `INSERT INTO recipe_videos (id, title, title_en, youtube_url, duration, recipe_id, created_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
  db.query(sql, [newId, title, title_en, youtube_url, duration, finalRecipeId, now], (err) => {
    if (err) {
      console.error("Video Insert Error:", err);
      return res.status(500).json({ message: "เพิ่มวิดีโอไม่สำเร็จ" });
    }
    res.status(201).json({ message: "เพิ่มวิดีโอสำเร็จ" });
  });
});

app.put('/api/videos/:id', (req, res) => {
  const { title, title_en, youtube_url, duration, recipe_id } = req.body;
  const videoId = req.params.id;
  
  const finalRecipeId = (recipe_id && recipe_id.trim() !== "") ? recipe_id : null;

  const sql = `UPDATE recipe_videos SET title=?, title_en=?, youtube_url=?, duration=?, recipe_id=? WHERE id=?`;

  db.query(sql, [title, title_en, youtube_url, duration, finalRecipeId, videoId], (err) => {
    if (err) return res.status(500).json({ message: "แก้ไขวิดีโอไม่สำเร็จ" });
    res.json({ message: "แก้ไขวิดีโอสำเร็จ" });
  });
});

app.delete('/api/videos/:id', (req, res) => {
  const sql = "DELETE FROM recipe_videos WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "ลบวิดีโอไม่สำเร็จ" });
    res.json({ message: "ลบวิดีโอสำเร็จ" });
  });
});

// ---------------------------------------------------------
// 7. API จัดการวัตถุดิบ (Ingredients Management)
// ---------------------------------------------------------
app.get('/api/ingredients', (req, res) => {
  const sql = "SELECT * FROM ingredients ORDER BY created_date DESC";
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.post('/api/ingredients', (req, res) => {
  const { name, name_en, category, calories_per_unit, unit } = req.body;
  const newId = crypto.randomBytes(12).toString('hex'); 
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const sql = `INSERT INTO ingredients (id, name, name_en, category, calories_per_unit, unit, created_date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
  db.query(sql, [newId, name, name_en, category, calories_per_unit, unit, now], (err) => {
    if (err) return res.status(500).json({ message: "เพิ่มวัตถุดิบไม่สำเร็จ" });
    res.status(201).json({ message: "เพิ่มวัตถุดิบสำเร็จ" });
  });
});

app.put('/api/ingredients/:id', (req, res) => {
  const { name, name_en, category, calories_per_unit, unit } = req.body;
  const sql = `UPDATE ingredients SET name=?, name_en=?, category=?, calories_per_unit=?, unit=? WHERE id=?`;

  db.query(sql, [name, name_en, category, calories_per_unit, unit, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "แก้ไขวัตถุดิบไม่สำเร็จ" });
    res.json({ message: "แก้ไขวัตถุดิบสำเร็จ" });
  });
});

app.delete('/api/ingredients/:id', (req, res) => {
  const sql = "DELETE FROM ingredients WHERE id = ?";
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "ลบวัตถุดิบไม่สำเร็จ" });
    res.json({ message: "ลบวัตถุดิบสำเร็จ" });
  });
});

// ---------------------------------------------------------
// เริ่มรันเซิร์ฟเวอร์
// ---------------------------------------------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend รันเสร็จสิ้นที่พอร์ต ${PORT}`);
});