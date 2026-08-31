import { saveBase64Image } from './uploadController.js';
import db from '../config/database.js';

const publicImage = (value) => {
  const v = String(value || '');
  return v.startsWith('http://') || v.startsWith('https://') || v.startsWith('data:') || v.startsWith('/')
    ? v
    : `/uploads/${v}`;
};

const normalizeCourse = (row) => {
  const pct = Number(row.discount_percent || 0);
  const now = new Date().toISOString().slice(0, 10);
  const start = row.discount_start_date ? String(row.discount_start_date).slice(0, 10) : null;
  const end = row.discount_end_date ? String(row.discount_end_date).slice(0, 10) : null;
  const discountActive = pct > 0 && (!start || now >= start) && (!end || now <= end);
  const price = Number(row.price || 0);

  return {
    id: String(row.course_id),
    title: row.course_title,
    description: row.description,
    thumbnail: publicImage(row.thumbnail_url),
    instructor: row.instructor_name || '',
    instructorRole: row.instructor_role || '',
    rating: Number(row.average_rating || 0),
    discount_percent: pct,
    discount_start_date: row.discount_start_date || '',
    discount_end_date: row.discount_end_date || '',
    reviews: Number(row.review_count || 0),
    price,
    category: row.category_name,
    level: row.level
      ? row.level.charAt(0).toUpperCase() + row.level.slice(1)
      : 'Beginner',
    course_slug: row.course_slug,
    slug: row.course_slug,
    duration_hours: Number(row.duration_hours || 0),
    language: 'Bahasa Indonesia',
    final_price: discountActive ? Math.max(0, price * (1 - pct / 100)) : price,
    discount_active: discountActive,
  };
};

const baseSelect = `
  SELECT
    c.*,
    cat.category_name,
    cat.category_slug,
    u.name AS instructor_name,
    u.role AS instructor_role,
    COALESCE((
      SELECT COUNT(*)
      FROM reviews r
      WHERE r.course_id = c.course_id
    ), 0) AS review_count
  FROM courses c
  JOIN categories cat ON cat.category_id = c.category_id
  LEFT JOIN users u ON u.user_id = c.instructor_id
`;

const levelValue = (value) => {
  const v = String(value || 'beginner').toLowerCase();
  return ['beginner', 'intermediate', 'advanced'].includes(v) ? v : 'beginner';
};

const slugify = (value) =>
  String(value || 'course')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'course';

async function uniqueCourseSlug(connection, title, currentId = null) {
  const base = slugify(title);
  let slug = base;
  let suffix = 2;

  while (true) {
    const result = currentId
      ? await connection.query(
          'SELECT course_id FROM courses WHERE course_slug = $1 AND course_id <> $2 LIMIT 1',
          [slug, currentId]
        )
      : await connection.query(
          'SELECT course_id FROM courses WHERE course_slug = $1 LIMIT 1',
          [slug]
        );

    const rows = result[0];
    if (!rows.length) return slug;
    slug = `${base}-${suffix++}`;
  }
}

async function ensureCategory(connection, categoryName) {
  const name = String(categoryName || 'Uncategorized').trim() || 'Uncategorized';
  const slug = slugify(name);

  const [found] = await connection.query(
    `SELECT category_id
     FROM categories
     WHERE category_name = $1 OR category_slug = $2
     LIMIT 1`,
    [name, slug]
  );

  if (found.length) return found[0].category_id;

  const [result] = await connection.query(
    `INSERT INTO categories (category_name, category_slug, description)
     VALUES ($1, $2, $3)
     RETURNING category_id`,
    [name, slug, 'Kategori dibuat otomatis dari API']
  );

  return result[0].category_id;
}

async function ensureInstructor(connection, name, role) {
  const instructorName = String(name || 'Administrator').trim() || 'Administrator';
  const emailSlug = slugify(instructorName);
  const email = `${emailSlug}@local.video-belajar.test`;

  const [found] = await connection.query(
    'SELECT user_id FROM users WHERE name = $1 LIMIT 1',
    [instructorName]
  );

  if (found.length) return found[0].user_id;

  const [result] = await connection.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING user_id`,
    [instructorName, email, 'local-development-only', role || 'instructor']
  );

  return result[0].user_id;
}

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

    const addParam = (value) => {
      params.push(value);
      return `$${params.length}`;
    };

    if (keyword) {
      const p1 = addParam(`%${keyword}%`);
      const p2 = addParam(`%${keyword}%`);
      const p3 = addParam(`%${keyword}%`);
      conditions.push(`(
        c.course_title ILIKE ${p1}
        OR c.description ILIKE ${p2}
        OR cat.category_name ILIKE ${p3}
      )`);
    }

    if (category) {
      conditions.push(`cat.category_slug = ${addParam(String(category).toLowerCase())}`);
    }

    if (level) {
      conditions.push(`c.level = ${addParam(String(level).toLowerCase())}`);
    }

    if (minPrice !== undefined && minPrice !== '') {
      conditions.push(`c.price >= ${addParam(Number(minPrice))}`);
    }

    if (maxPrice !== undefined && maxPrice !== '') {
      conditions.push(`c.price <= ${addParam(Number(maxPrice))}`);
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

    return res.json({
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
  } catch (error) {
    next(error);
  }
};

export const getCourseBySlug = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `${baseSelect} WHERE c.course_slug = $1`,
      [req.params.slug]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Course tidak ditemukan',
      });
    }

    const [videos] = await db.query(
      `SELECT video_id, title, duration_seconds, video_url, is_preview
       FROM videos
       WHERE course_id = $1
       ORDER BY order_index ASC`,
      [rows[0].course_id]
    );

    const course = normalizeCourse(rows[0]);
    course.lessons = videos.map((video) => ({
      id: video.video_id,
      title: video.title,
      duration_seconds: video.duration_seconds,
      video_url: video.video_url,
      is_preview: Boolean(video.is_preview),
    }));

    return res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const getCourseById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `${baseSelect} WHERE c.course_id = $1`,
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: 'Course tidak ditemukan',
      });
    }

    const [videos] = await db.query(
      `SELECT video_id, title, duration_seconds, video_url, is_preview
       FROM videos
       WHERE course_id = $1
       ORDER BY order_index ASC`,
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

    return res.json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();

    const {
      title,
      description = '',
      thumbnail,
      thumbnailData,
      instructor = '',
      instructorRole = 'instructor',
      rating = 0,
      price = 0,
      category,
      level = 'Beginner',
      duration_hours = 0,
      discount_percent = 0,
      discount_start_date = null,
      discount_end_date = null,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'title wajib diisi' });
    }

    if (!thumbnail && !thumbnailData) {
      return res.status(400).json({
        success: false,
        message: 'Gambar thumbnail wajib dipilih',
      });
    }

    if (!category) {
      return res.status(400).json({ success: false, message: 'category wajib diisi' });
    }

    if (Number(discount_percent) < 0 || Number(discount_percent) > 100) {
      return res.status(400).json({
        success: false,
        message: 'discount_percent harus 0-100',
      });
    }

    if (
      discount_start_date &&
      discount_end_date &&
      String(discount_start_date) > String(discount_end_date)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal mulai diskon tidak boleh setelah tanggal akhir',
      });
    }

    await connection.beginTransaction();

    const uploadedThumbnail = thumbnailData
      ? await saveBase64Image(
          thumbnailData,
          req.body.thumbnailName,
          'courses'
        )
      : thumbnail;

    const categoryId = await ensureCategory(connection, category);
    const instructorId = await ensureInstructor(
      connection,
      instructor,
      instructorRole
    );
    const courseSlug = await uniqueCourseSlug(connection, title);

    const [inserted] = await connection.query(
      `INSERT INTO courses (
        instructor_id,
        category_id,
        course_title,
        course_slug,
        thumbnail_url,
        level,
        duration_hours,
        description,
        total_students,
        average_rating,
        price,
        discount_percent,
        discount_start_date,
        discount_end_date
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14
      )
      RETURNING course_id`,
      [
        instructorId,
        categoryId,
        title.trim(),
        courseSlug,
        uploadedThumbnail,
        levelValue(level),
        Number(duration_hours) || 0,
        description,
        0,
        Number(rating) || 0,
        Number(price) || 0,
        Number(discount_percent) || 0,
        discount_start_date || null,
        discount_end_date || null,
      ]
    );

    await connection.commit();

    const [rows] = await db.query(
      `${baseSelect} WHERE c.course_id = $1`,
      [inserted[0].course_id]
    );

    return res.status(201).json({
      success: true,
      data: normalizeCourse(rows[0]),
    });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

export const updateCourse = async (req, res, next) => {
  let connection;

  try {
    connection = await db.getConnection();
    const id = req.params.id;

    const [existing] = await connection.query(
      'SELECT * FROM courses WHERE course_id = $1',
      [id]
    );

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: 'Course tidak ditemukan',
      });
    }

    const current = existing[0];
    const body = req.body;

    const uploadedThumbnail = body.thumbnailData
      ? await saveBase64Image(body.thumbnailData, body.thumbnailName, 'courses')
      : null;

    const nextDiscount = Number(
      body.discount_percent ?? current.discount_percent ?? 0
    );
    const nextStart = body.discount_start_date ?? current.discount_start_date ?? null;
    const nextEnd = body.discount_end_date ?? current.discount_end_date ?? null;

    if (nextDiscount < 0 || nextDiscount > 100) {
      return res.status(400).json({
        success: false,
        message: 'discount_percent harus 0-100',
      });
    }

    if (nextStart && nextEnd && String(nextStart) > String(nextEnd)) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal mulai diskon tidak boleh setelah tanggal akhir',
      });
    }

    await connection.beginTransaction();

    const categoryId = body.category
      ? await ensureCategory(connection, body.category)
      : current.category_id;

    const nextTitle = body.title ?? current.course_title;
    const nextSlug =
      body.title && body.title !== current.course_title
        ? await uniqueCourseSlug(connection, nextTitle, id)
        : current.course_slug;

    const instructorId = body.instructor
      ? await ensureInstructor(
          connection,
          body.instructor,
          body.instructorRole || 'instructor'
        )
      : current.instructor_id;

    const thumbnailValue =
      uploadedThumbnail || body.thumbnail || current.thumbnail_url;

    await connection.query(
      `UPDATE courses
       SET
         instructor_id = $1,
         category_id = $2,
         course_title = $3,
         course_slug = $4,
         thumbnail_url = $5,
         level = $6,
         duration_hours = $7,
         description = $8,
         average_rating = $9,
         price = $10,
         discount_percent = $11,
         discount_start_date = $12,
         discount_end_date = $13,
         updated_at = CURRENT_TIMESTAMP
       WHERE course_id = $14`,
      [
        instructorId,
        categoryId,
        nextTitle,
        nextSlug,
        thumbnailValue,
        levelValue(body.level ?? current.level),
        Number(body.duration_hours ?? current.duration_hours) || 0,
        body.description ?? current.description,
        Number(body.rating ?? current.average_rating) || 0,
        Number(body.price ?? current.price) || 0,
        nextDiscount,
        nextStart,
        nextEnd,
        id,
      ]
    );

    await connection.commit();

    const [rows] = await db.query(
      `${baseSelect} WHERE c.course_id = $1`,
      [id]
    );

    return res.json({
      success: true,
      data: normalizeCourse(rows[0]),
    });
  } catch (error) {
    if (connection) await connection.rollback().catch(() => {});
    next(error);
  } finally {
    if (connection) connection.release();
  }
};

export const deleteCourse = async (req, res, next) => {
  try {
    const [existing] = await db.query(
      'SELECT course_id FROM courses WHERE course_id = $1 LIMIT 1',
      [req.params.id]
    );

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: 'Course tidak ditemukan',
      });
    }

    await db.query(
      'DELETE FROM courses WHERE course_id = $1',
      [req.params.id]
    );

    return res.json({
      success: true,
      message: 'Course berhasil dihapus',
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(409).json({
        success: false,
        message: 'Course tidak dapat dihapus karena masih digunakan oleh data lain',
      });
    }

    next(error);
  }
};
