import { saveBase64Image } from './uploadController.js';
import db from '../config/database.js';

const publicImage = (value) => {
  const v = String(value || '');
  return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:') || v.startsWith('/') ? v : `/uploads/${v}`;
};

const normalizeCourse = (row) => ({
  id: String(row.course_id),
  title: row.course_title,
  description: row.description,
  thumbnail: publicImage(row.thumbnail_url),
  instructor: row.instructor_name || '',
  instructorRole: row.instructor_role || '',
  rating: Number(row.average_rating || 0),
  discount_percent: Number(row.discount_percent || 0),
  discount_start_date: row.discount_start_date || '',
  discount_end_date: row.discount_end_date || '',
  reviews: Number(row.review_count || 0),
  price: Number(row.price || 0),
  category: row.category_name,
  level: row.level ? row.level.charAt(0).toUpperCase() + row.level.slice(1) : 'Beginner',
  course_slug: row.course_slug,
  slug: row.course_slug,
  duration_hours: row.duration_hours,
  language: 'Bahasa Indonesia',
  final_price: (() => {
    const pct = Number(row.discount_percent || 0);
    const now = new Date().toISOString().slice(0,10);
    const start = row.discount_start_date ? String(row.discount_start_date).slice(0,10) : null;
    const end = row.discount_end_date ? String(row.discount_end_date).slice(0,10) : null;
    const active = pct > 0 && (!start || now >= start) && (!end || now <= end);
    return active ? Math.max(0, Number(row.price || 0) * (1 - pct/100)) : Number(row.price || 0);
  })(),
  discount_active: (() => {
    const pct = Number(row.discount_percent || 0); const now = new Date().toISOString().slice(0,10);
    const start = row.discount_start_date ? String(row.discount_start_date).slice(0,10) : null; const end = row.discount_end_date ? String(row.discount_end_date).slice(0,10) : null;
    return pct > 0 && (!start || now >= start) && (!end || now <= end);
  })()
});

const baseSelect = `
SELECT c.*, cat.category_name, u.name AS instructor_name, u.role AS instructor_role,
       COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.course_id = c.course_id), 0) AS review_count
FROM courses c
JOIN categories cat ON cat.category_id = c.category_id
LEFT JOIN users u ON u.user_id = c.instructor_id`;

export const getCourses = async (req, res, next) => {
  try {
    const {
      q = '',
      search = '',
      category,
      level,
      minPrice,
      maxPrice,
      sortBy = 'created_at',
      order = 'desc',
    } = req.query;

    const conditions = [];
    const params = [];
    const keyword = String(q || search || '').trim();

    if (keyword) {
      conditions.push('(c.course_title LIKE ? OR c.description LIKE ? OR cat.category_name LIKE ?)');
      const like = `%${keyword}%`;
      params.push(like, like, like);
    }
    if (category) {
      conditions.push('cat.category_slug = ?');
      params.push(String(category).toLowerCase());
    }
    if (level) {
      conditions.push('c.level = ?');
      params.push(String(level).toLowerCase());
    }
    if (minPrice !== undefined && minPrice !== '') {
      conditions.push('c.price >= ?');
      params.push(Number(minPrice));
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      conditions.push('c.price <= ?');
      params.push(Number(maxPrice));
    }

    const sortMap = {
      title: 'c.course_title',
      price: 'c.price',
      rating: 'c.average_rating',
      students: 'c.total_students',
      created_at: 'c.created_at',
    };
    const sortColumn = sortMap[sortBy] || sortMap.created_at;
    const sortOrder = String(order).toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const where = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '';

    const [rows] = await db.query(
      `${baseSelect}${where} ORDER BY ${sortColumn} ${sortOrder}`,
      params
    );

    res.json({
      success: true,
      data: rows.map(normalizeCourse),
      meta: {
        search: keyword,
        category: category || null,
        level: level || null,
        sortBy,
        order: sortOrder.toLowerCase(),
        total: rows.length,
      },
    });
  } catch (e) { next(e); }
};

export const getCourseBySlug = async (req, res, next) => {
  try {
    const [rows] = await db.query(`${baseSelect} WHERE c.course_slug = ?`, [req.params.slug]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Course tidak ditemukan' });
    const [videos] = await db.query(
      'SELECT video_id, title, duration_seconds, video_url, is_preview FROM videos WHERE course_id = ? ORDER BY order_index ASC',
      [rows[0].course_id]
    );
    const course = normalizeCourse(rows[0]);
    course.lessons = videos.map((video) => ({
      id: video.video_id, title: video.title, duration_seconds: video.duration_seconds,
      video_url: video.video_url, is_preview: Boolean(video.is_preview),
    }));
    res.json({ success:true, data: course });
  } catch (e) { next(e); }
};

export const getCourseById = async (req, res, next) => {
  try {
    const [rows] = await db.query(`${baseSelect} WHERE c.course_id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success:false, message:'Course tidak ditemukan' });
    const [videos] = await db.query(
      'SELECT video_id, title, duration_seconds, video_url, is_preview FROM videos WHERE course_id = ? ORDER BY order_index ASC',
      [req.params.id]
    );
    const course = normalizeCourse(rows[0]);
    course.lessons = videos.map((video) => ({
      id: video.video_id,
      title: video.title,
      duration_seconds: video.duration_seconds,
      video_url: video.video_url,
      is_preview: Boolean(video.is_preview),
    }));
    res.json({ success:true, data: course });
  } catch (e) { next(e); }
};

async function ensureCategory(connection, categoryName) {
  const slug = String(categoryName || 'Uncategorized').trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'uncategorized';
  const [found] = await connection.query('SELECT category_id FROM categories WHERE category_name = ? OR category_slug = ? LIMIT 1', [categoryName, slug]);
  if (found.length) return found[0].category_id;
  const [result] = await connection.query('INSERT INTO categories (category_name, category_slug, description) VALUES (?, ?, ?)', [categoryName || 'Uncategorized', slug, 'Kategori dibuat otomatis dari API']);
  return result.insertId;
}

async function ensureInstructor(connection, name, role) {
  const instructorName = String(name || 'Administrator').trim() || 'Administrator';
  const emailSlug = instructorName.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'administrator';
  const email = `${emailSlug}@local.video-belajar.test`;
  const [found] = await connection.query('SELECT user_id FROM users WHERE name = ? LIMIT 1', [instructorName]);
  if (found.length) return found[0].user_id;
  const [result] = await connection.query('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)', [instructorName,email,'local-development-only',role || 'instructor']);
  return result.insertId;
}

function slugify(value) {
  return String(value || 'course').trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'') || 'course';
}

async function uniqueCourseSlug(connection, title, currentId = null) {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;
  while (true) {
    const params = currentId ? [slug, currentId] : [slug];
    const sql = currentId
      ? 'SELECT course_id FROM courses WHERE course_slug = ? AND course_id <> ? LIMIT 1'
      : 'SELECT course_id FROM courses WHERE course_slug = ? LIMIT 1';
    const [rows] = await connection.query(sql, params);
    if (!rows.length) return slug;
    slug = `${base}-${suffix++}`;
  }
}
function levelValue(value) {
  const v = String(value || 'beginner').toLowerCase();
  return ['beginner','intermediate','advanced'].includes(v) ? v : 'beginner';
}

export const createCourse = async (req, res, next) => {
  let conn;
  try {
    conn = await db.getConnection();
    const { title, description='', thumbnail, thumbnailData, instructor='', instructorRole='instructor', rating=0, price=0, category, level='Beginner', duration_hours=0, discount_percent=0, discount_start_date=null, discount_end_date=null } = req.body;
    if (!title?.trim()) return res.status(400).json({ success:false, message:'title wajib diisi' });
    if (!thumbnail && !thumbnailData) return res.status(400).json({ success:false, message:'Gambar thumbnail wajib dipilih' });
    if (!category) return res.status(400).json({ success:false, message:'category wajib diisi' });
    if (Number(discount_percent) < 0 || Number(discount_percent) > 100) return res.status(400).json({ success:false, message:'discount_percent harus 0-100' });
    if (discount_start_date && discount_end_date && String(discount_start_date) > String(discount_end_date)) return res.status(400).json({ success:false, message:'Tanggal mulai diskon tidak boleh setelah tanggal akhir' });
    await conn.beginTransaction();
    const uploadedThumbnail = thumbnailData ? await saveBase64Image(thumbnailData, req.body.thumbnailName, 'courses') : thumbnail;
    const categoryId = await ensureCategory(conn, category);
    const instructorId = await ensureInstructor(conn, instructor, instructorRole);
    const courseSlug = await uniqueCourseSlug(conn, title);
    const [result] = await conn.query(`INSERT INTO courses (instructor_id,category_id,course_title,course_slug,thumbnail_url,level,duration_hours,description,total_students,average_rating,price,discount_percent,discount_start_date,discount_end_date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`, [instructorId,categoryId,title.trim(),courseSlug,uploadedThumbnail,levelValue(level),Number(duration_hours)||0,description,0,Number(rating)||0,Number(price)||0,Number(discount_percent)||0,discount_start_date||null,discount_end_date||null]);
    await conn.commit();
    const [rows] = await conn.query(`${baseSelect} WHERE c.course_id = ?`, [result.insertId]);
    res.status(201).json({ success:true, data: normalizeCourse(rows[0]) });
  } catch (e) { if (conn) await conn.rollback(); next(e); } finally { if (conn) conn.release(); }
};

export const updateCourse = async (req, res, next) => {
  let conn;
  try {
    conn = await db.getConnection();
    const id = req.params.id;
    const [existing] = await conn.query('SELECT * FROM courses WHERE course_id = ?', [id]);
    if (!existing.length) return res.status(404).json({ success:false, message:'Course tidak ditemukan' });
    const current = existing[0], body=req.body;
    const uploadedThumbnail = body.thumbnailData ? await saveBase64Image(body.thumbnailData, body.thumbnailName, 'courses') : null;
    const nextDiscount = Number(body.discount_percent ?? current.discount_percent ?? 0);
    const nextStart = body.discount_start_date ?? current.discount_start_date ?? null;
    const nextEnd = body.discount_end_date ?? current.discount_end_date ?? null;
    if (nextDiscount < 0 || nextDiscount > 100) return res.status(400).json({ success:false, message:'discount_percent harus 0-100' });
    if (nextStart && nextEnd && String(nextStart) > String(nextEnd)) return res.status(400).json({ success:false, message:'Tanggal mulai diskon tidak boleh setelah tanggal akhir' });
    await conn.beginTransaction();
    const categoryId = body.category ? await ensureCategory(conn, body.category) : current.category_id;
    const nextTitle = body.title ?? current.course_title;
    const nextSlug = body.title && body.title !== current.course_title ? await uniqueCourseSlug(conn, nextTitle, id) : current.course_slug;
    const instructorId = body.instructor ? await ensureInstructor(conn, body.instructor, body.instructorRole || 'instructor') : current.instructor_id;
    await conn.query(`UPDATE courses SET instructor_id=?,category_id=?,course_title=?,course_slug=?,thumbnail_url=?,level=?,duration_hours=?,description=?,average_rating=?,price=?,discount_percent=?,discount_start_date=?,discount_end_date=? WHERE course_id=?`, [instructorId,categoryId,nextTitle,nextSlug,uploadedThumbnail || body.thumbnail || current.thumbnail_url,levelValue(body.level ?? current.level),Number(body.duration_hours ?? current.duration_hours)||0,body.description ?? current.description,Number(body.rating ?? current.average_rating)||0,Number(body.price ?? current.price)||0,nextDiscount,nextStart,nextEnd,id]);
    await conn.commit();
    const [rows] = await conn.query(`${baseSelect} WHERE c.course_id = ?`, [id]);
    res.json({ success:true, data: normalizeCourse(rows[0]) });
  } catch (e) { if (conn) await conn.rollback(); next(e); } finally { if (conn) conn.release(); }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const [result] = await db.query('DELETE FROM courses WHERE course_id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success:false, message:'Course tidak ditemukan' });
    res.json({ success:true, message:'Course berhasil dihapus' });
  } catch (e) { next(e); }
};
