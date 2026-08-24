SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS video_belajar
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE video_belajar;

CREATE TABLE IF NOT EXISTS categories (
 category_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 category_name VARCHAR(100) NOT NULL,
 category_slug VARCHAR(100) NOT NULL UNIQUE,
 description TEXT NULL,
 icon_url VARCHAR(255) NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 INDEX idx_categories_name(category_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS users (
 user_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 name VARCHAR(255) NOT NULL,
 email VARCHAR(255) NOT NULL UNIQUE,
 password_hash VARCHAR(255) NOT NULL,
 role VARCHAR(50) NULL DEFAULT 'student',
 phone_number VARCHAR(20) NULL,
 avatar_url VARCHAR(255) NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 email_verified_at TIMESTAMP NULL,
 updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
 INDEX idx_users_role(role),
 INDEX idx_users_created_at(created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS courses (
 course_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 instructor_id BIGINT UNSIGNED NOT NULL,
 category_id BIGINT UNSIGNED NOT NULL,
 course_title VARCHAR(255) NOT NULL,
 course_slug VARCHAR(255) NOT NULL UNIQUE,
 thumbnail_url MEDIUMTEXT NOT NULL,
 promo_video_url VARCHAR(255) NULL,
 level ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
 duration_hours INT UNSIGNED NOT NULL DEFAULT 0,
 description MEDIUMTEXT NOT NULL,
 total_students INT UNSIGNED NOT NULL DEFAULT 0,
 average_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
 price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
 discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0.00,
 discount_start_date DATE NULL,
 discount_end_date DATE NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT fk_courses_instructor FOREIGN KEY(instructor_id) REFERENCES users(user_id),
 CONSTRAINT fk_courses_category FOREIGN KEY(category_id) REFERENCES categories(category_id),
 INDEX idx_courses_instructor(instructor_id),
 INDEX idx_courses_category_level(category_id,level),
 INDEX idx_courses_duration(duration_hours),
 INDEX idx_courses_discount_dates(discount_start_date,discount_end_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS enrollments (
 enrollment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NOT NULL,
 course_id BIGINT UNSIGNED NOT NULL,
 enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 progress_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
 is_completed BOOLEAN NOT NULL DEFAULT FALSE,
 completed_at TIMESTAMP NULL,
 CONSTRAINT fk_enrollments_user FOREIGN KEY(user_id) REFERENCES users(user_id),
 CONSTRAINT fk_enrollments_course FOREIGN KEY(course_id) REFERENCES courses(course_id),
 UNIQUE KEY uq_enrollments_user_course(user_id,course_id),
 INDEX idx_enrollments_course(course_id),
 INDEX idx_enrollments_user_completed(user_id,is_completed)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS videos (
 video_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 course_id BIGINT UNSIGNED NOT NULL,
 title VARCHAR(255) NOT NULL,
 order_index INT UNSIGNED NOT NULL,
 duration_seconds INT UNSIGNED NOT NULL DEFAULT 0,
 video_url VARCHAR(255) NOT NULL,
 is_preview BOOLEAN NOT NULL DEFAULT FALSE,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_videos_course FOREIGN KEY(course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
 UNIQUE KEY uq_videos_course_order(course_id,order_index),
 INDEX idx_videos_course_order(course_id,order_index)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS questions (
 question_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 course_id BIGINT UNSIGNED NOT NULL,
 question_text TEXT NOT NULL,
 question_type ENUM('multiple_choice','true_false') NOT NULL DEFAULT 'multiple_choice',
 points INT UNSIGNED NOT NULL DEFAULT 10,
 phase ENUM('pretest','quiz','final') NOT NULL DEFAULT 'quiz',
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT fk_questions_course FOREIGN KEY(course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
 INDEX idx_questions_course_type(course_id,question_type),
 INDEX idx_questions_course_phase(course_id,phase)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS question_options (
 option_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 question_id BIGINT UNSIGNED NOT NULL,
 option_text VARCHAR(255) NOT NULL,
 is_correct BOOLEAN NOT NULL DEFAULT FALSE,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_question_options_question FOREIGN KEY(question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
 INDEX idx_question_options_question_correct(question_id,is_correct)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS question_answers (
 answer_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 enrollment_id BIGINT UNSIGNED NOT NULL,
 question_id BIGINT UNSIGNED NOT NULL,
 option_id BIGINT UNSIGNED NOT NULL,
 is_correct BOOLEAN NOT NULL DEFAULT FALSE,
 answered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_question_answers_enrollment FOREIGN KEY(enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
 CONSTRAINT fk_question_answers_question FOREIGN KEY(question_id) REFERENCES questions(question_id) ON DELETE CASCADE,
 CONSTRAINT fk_question_answers_option FOREIGN KEY(option_id) REFERENCES question_options(option_id) ON DELETE CASCADE,
 UNIQUE KEY uq_question_answers_enrollment_question(enrollment_id,question_id),
 INDEX idx_question_answers_question_option(question_id,option_id),
 INDEX idx_question_answers_enrollment(enrollment_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reviews (
 review_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NOT NULL,
 course_id BIGINT UNSIGNED NOT NULL,
 rating TINYINT UNSIGNED NOT NULL,
 comment TEXT NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT fk_reviews_user FOREIGN KEY(user_id) REFERENCES users(user_id),
 CONSTRAINT fk_reviews_course FOREIGN KEY(course_id) REFERENCES courses(course_id) ON DELETE CASCADE,
 UNIQUE KEY uq_reviews_user_course(user_id,course_id),
 INDEX idx_reviews_course_rating(course_id,rating)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS orders (
 order_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 user_id BIGINT UNSIGNED NOT NULL,
 order_number VARCHAR(50) NOT NULL UNIQUE,
 total_amount DECIMAL(12,2) NOT NULL,
 status ENUM('pending','completed','expired') NOT NULL DEFAULT 'pending',
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
 CONSTRAINT fk_orders_user FOREIGN KEY(user_id) REFERENCES users(user_id),
 INDEX idx_orders_user_status(user_id,status),
 INDEX idx_orders_created_at(created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
 order_item_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 order_id BIGINT UNSIGNED NOT NULL,
 course_id BIGINT UNSIGNED NOT NULL,
 price_at_purchase DECIMAL(12,2) NOT NULL,
 discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
 CONSTRAINT fk_order_items_order FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
 CONSTRAINT fk_order_items_course FOREIGN KEY(course_id) REFERENCES courses(course_id),
 UNIQUE KEY uq_order_items_order_course(order_id,course_id),
 INDEX idx_order_items_course(course_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment_methods (
 payment_method_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 method_name VARCHAR(100) NOT NULL,
 provider_code VARCHAR(50) NOT NULL UNIQUE,
 is_active BOOLEAN NOT NULL DEFAULT TRUE,
 icon_url VARCHAR(255) NULL,
 INDEX idx_payment_methods_active(is_active)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
 payment_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 order_id BIGINT UNSIGNED NOT NULL,
 payment_method_id BIGINT UNSIGNED NOT NULL,
 amount DECIMAL(12,2) NOT NULL,
 payment_status ENUM('pending','success','failed') NOT NULL DEFAULT 'pending',
 transaction_id VARCHAR(100) NULL UNIQUE,
 paid_at TIMESTAMP NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT fk_payments_order FOREIGN KEY(order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
 CONSTRAINT fk_payments_method FOREIGN KEY(payment_method_id) REFERENCES payment_methods(payment_method_id),
 INDEX idx_payments_order_status(order_id,payment_status),
 INDEX idx_payments_method(payment_method_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS certificates (
 certificate_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 enrollment_id BIGINT UNSIGNED NOT NULL UNIQUE,
 certificate_url VARCHAR(255) NOT NULL,
 issued_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 certificate_code VARCHAR(100) NULL UNIQUE,
 CONSTRAINT fk_certificates_enrollment FOREIGN KEY(enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS video_progress (
 video_progress_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 enrollment_id BIGINT UNSIGNED NOT NULL,
 video_id BIGINT UNSIGNED NOT NULL,
 is_completed BOOLEAN NOT NULL DEFAULT FALSE,
 last_watched_at TIMESTAMP NULL,
 CONSTRAINT fk_video_progress_enrollment FOREIGN KEY(enrollment_id) REFERENCES enrollments(enrollment_id) ON DELETE CASCADE,
 CONSTRAINT fk_video_progress_video FOREIGN KEY(video_id) REFERENCES videos(video_id) ON DELETE CASCADE,
 UNIQUE KEY uq_video_progress_enrollment_video(enrollment_id,video_id),
 INDEX idx_video_progress_video(video_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS blog_posts (
 blog_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
 title VARCHAR(255) NOT NULL,
 category VARCHAR(100) NOT NULL DEFAULT 'Pendidikan',
 published_at DATE NOT NULL,
 image_url MEDIUMTEXT NULL,
 excerpt TEXT NULL,
 content LONGTEXT NOT NULL,
 source VARCHAR(255) NULL,
 created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
 updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
 UNIQUE KEY uq_blog_title(title),
 INDEX idx_blog_published(published_at),
 INDEX idx_blog_category(category)
) ENGINE=InnoDB;

-- ================================================================
-- DATA DEMO
-- ================================================================

INSERT INTO categories (category_name, category_slug, description) VALUES
('UI/UX Design','ui-ux-design','Desain produk dan pengalaman pengguna'),
('Digital & Teknologi','digital-teknologi','Teknologi, programming, dan data'),
('Bisnis Manajemen','bisnis-manajemen','Bisnis, finance, dan manajemen')
ON DUPLICATE KEY UPDATE
 category_name=VALUES(category_name), description=VALUES(description);

INSERT INTO users (name,email,password_hash,role) VALUES
('Jenna Ortega','jenna@video-belajar.test','seed-only','instructor'),
('Leandra Ayudhia','leandra@video-belajar.test','seed-only','instructor'),
('Hafid Ardiansyah','hafid@video-belajar.test','seed-only','instructor'),
('Demo Student','student@video-belajar.test','seed-only','student'),
('Admin Demo','admin@videobelajar.com','admin123','admin'),
('Super Admin Demo','superadmin@videobelajar.com','superadmin123','super_admin')
ON DUPLICATE KEY UPDATE
 name=VALUES(name), role=VALUES(role);

INSERT INTO courses
(course_id,instructor_id,category_id,course_title,course_slug,thumbnail_url,level,duration_hours,description,total_students,average_rating,price,discount_percent,discount_start_date,discount_end_date)
VALUES
(1,(SELECT user_id FROM users WHERE email='jenna@video-belajar.test'),(SELECT category_id FROM categories WHERE category_slug='bisnis-manajemen'),'Big 4 Auditor Financial Analyst','big-4-auditor-financial-analyst','https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80','beginner',8,'Mulai transformasi dengan instruktur profesional, materi praktis, dan latihan yang relevan dengan kebutuhan dunia kerja.',1250,3.50,300000,20.00,'2026-08-24','2026-09-30'),
(2,(SELECT user_id FROM users WHERE email='leandra@video-belajar.test'),(SELECT category_id FROM categories WHERE category_slug='ui-ux-design'),'UI/UX Design untuk Pemula','ui-ux-design-untuk-pemula','https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=1200&q=80','beginner',7,'Pelajari proses merancang pengalaman pengguna dari riset, wireframe, prototyping, hingga handoff.',980,4.80,250000,15.00,'2026-08-24','2026-09-15'),
(3,(SELECT user_id FROM users WHERE email='hafid@video-belajar.test'),(SELECT category_id FROM categories WHERE category_slug='digital-teknologi'),'React JS dari Dasar','react-js-dari-dasar','https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80','beginner',9,'Bangun aplikasi web modern dengan React, component, props, state, routing, dan integrasi API.',1520,4.90,199000,0.00,NULL,NULL),
(4,(SELECT user_id FROM users WHERE email='jenna@video-belajar.test'),(SELECT category_id FROM categories WHERE category_slug='digital-teknologi'),'Data Analyst untuk Karier Profesional','data-analyst-untuk-karier-profesional','https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80','intermediate',10,'Pelajari dasar analisis data, visualisasi, dan cara menyampaikan insight untuk kebutuhan bisnis.',870,4.70,275000,0.00,NULL,NULL),
(5,(SELECT user_id FROM users WHERE email='hafid@video-belajar.test'),(SELECT category_id FROM categories WHERE category_slug='digital-teknologi'),'JavaScript untuk Pemula','javascript-untuk-pemula','https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=1200&q=80','beginner',6,'Memahami fundamental JavaScript dengan latihan sederhana dan contoh kasus yang mudah dipahami.',1120,4.70,129000,0.00,NULL,NULL),
(6,(SELECT user_id FROM users WHERE email='leandra@video-belajar.test'),(SELECT category_id FROM categories WHERE category_slug='digital-teknologi'),'HTML & CSS Modern','html-css-modern','https://images.unsplash.com/photo-1621839673705-6617adf9e890?auto=format&fit=crop&w=1200&q=80','beginner',5,'Bangun tampilan website responsif menggunakan HTML semantic, CSS modern, dan layout yang rapi.',1340,4.90,99000,0.00,NULL,NULL)
ON DUPLICATE KEY UPDATE
 instructor_id=VALUES(instructor_id),
 category_id=VALUES(category_id),
 course_title=VALUES(course_title),
 thumbnail_url=VALUES(thumbnail_url),
 description=VALUES(description),
 duration_hours=VALUES(duration_hours),
 average_rating=VALUES(average_rating),
 price=VALUES(price),
 discount_percent=VALUES(discount_percent),
 discount_start_date=VALUES(discount_start_date),
 discount_end_date=VALUES(discount_end_date);

INSERT IGNORE INTO videos (course_id,title,order_index,duration_seconds,video_url,is_preview) VALUES
(1,'Dasar-dasar Financial Analyst',1,720,'https://example.com/video-1',1),
(1,'Analisis laporan keuangan',2,840,'https://example.com/video-2',0),
(1,'Financial modelling untuk pemula',3,900,'https://example.com/video-3',0),
(2,'Introduction to User Experience Design',1,720,'https://example.com/video-4',1),
(2,'Jobs in the field of user experience',2,720,'https://example.com/video-5',0),
(2,'The product development life cycle',3,720,'https://example.com/video-6',0),
(3,'Mengenal React dan component',1,840,'https://example.com/video-7',1),
(3,'State, props, dan event',2,900,'https://example.com/video-8',0),
(3,'React Router dan integrasi API',3,900,'https://example.com/video-9',0);

INSERT INTO reviews (user_id,course_id,rating,comment) VALUES
((SELECT user_id FROM users WHERE email='student@video-belajar.test'),1,4,'Materi mudah dipahami dan relevan.'),
((SELECT user_id FROM users WHERE email='student@video-belajar.test'),2,5,'Penjelasan tutor sangat jelas.'),
((SELECT user_id FROM users WHERE email='student@video-belajar.test'),3,5,'Latihan React membantu untuk project.'),
((SELECT user_id FROM users WHERE email='student@video-belajar.test'),4,5,'Materinya praktis.'),
((SELECT user_id FROM users WHERE email='student@video-belajar.test'),5,5,'Cocok untuk pemula.'),
((SELECT user_id FROM users WHERE email='student@video-belajar.test'),6,5,'Materi singkat dan jelas.')
ON DUPLICATE KEY UPDATE rating=VALUES(rating), comment=VALUES(comment);

INSERT INTO payment_methods (method_name, provider_code, is_active) VALUES
('Bank BCA','Bank BCA',TRUE),
('Bank BNI','Bank BNI',TRUE),
('Bank BRI','Bank BRI',TRUE),
('Bank Mandiri','Bank Mandiri',TRUE),
('Dana','Dana',TRUE),
('OVO','OVO',TRUE),
('LinkAja','LinkAja',TRUE),
('Shopee Pay','Shopee Pay',TRUE),
('Kartu Kredit/Debit','card',TRUE)
ON DUPLICATE KEY UPDATE method_name=VALUES(method_name), is_active=VALUES(is_active);

INSERT INTO blog_posts (title,category,published_at,image_url,excerpt,content,source) VALUES
('MODULAR Summit 2026 Perkuat Peran Pendidik dalam Transformasi Pembelajaran Digital','Pendidikan','2026-08-20','https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80','Transformasi pembelajaran digital membutuhkan pendidik yang adaptif, kreatif, dan siap memanfaatkan teknologi secara bertanggung jawab.','Transformasi digital terus mengubah cara peserta didik memperoleh pengetahuan. Pendidik tidak lagi hanya menjadi penyampai materi, tetapi juga perancang pengalaman belajar yang relevan dengan kebutuhan zaman.\n\nPemanfaatan kecerdasan artifisial, laboratorium maya, gim edukasi, dan media interaktif dapat membantu menciptakan pembelajaran yang lebih aktif.','Video Belajar Editorial'),
('AI dalam Pembelajaran: Peluang Baru untuk Guru dan Pelajar','Teknologi','2026-08-19','https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80','Kecerdasan artifisial dapat membantu personalisasi belajar, pencarian ide, dan evaluasi selama digunakan secara etis.','AI menghadirkan banyak peluang baru dalam pendidikan. Pelajar dapat menggunakannya untuk mendapatkan penjelasan alternatif, menyusun ide, dan berlatih.\n\nGuru juga dapat memanfaatkan AI untuk membuat variasi latihan dan memperoleh inspirasi aktivitas kelas.','Video Belajar Editorial')
ON DUPLICATE KEY UPDATE
 category=VALUES(category),
 published_at=VALUES(published_at),
 excerpt=VALUES(excerpt),
 content=VALUES(content),
 image_url=VALUES(image_url);

SET FOREIGN_KEY_CHECKS = 1;

-- Verifikasi setelah import:
SELECT DATABASE() AS database_aktif;
SELECT COUNT(*) AS jumlah_kategori FROM categories;
SELECT COUNT(*) AS jumlah_course FROM courses;
SELECT COUNT(*) AS jumlah_blog FROM blog_posts;
