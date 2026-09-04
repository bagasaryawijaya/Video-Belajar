const key = (userEmail, courseId) => `videoBelajarLearning:${String(userEmail || "guest").toLowerCase()}:${courseId}`;

export const defaultLearning = {
  completedItems: [],
  quizScore: null,
  finalScore: null,
  pretestScore: null,
  answers: {},
  review: null,
};

export function readLearning(userEmail, courseId) {
  try {
    const value = JSON.parse(localStorage.getItem(key(userEmail, courseId)));
    return { ...defaultLearning, ...(value || {}) };
  } catch {
    return { ...defaultLearning };
  }
}

export function saveLearning(userEmail, courseId, value) {
  const next = { ...defaultLearning, ...value };
  localStorage.setItem(key(userEmail, courseId), JSON.stringify(next));
  return next;
}

export const learningItemCount = 12;
export function progressFromLearning(learning) {
  return Math.min(100, Math.round(((learning?.completedItems?.length || 0) / learningItemCount) * 100));
}

export function canDownloadCertificate(learning) {
  return progressFromLearning(learning) >= 100 && Number(learning?.finalScore || 0) >= 70;
}

export function scoreMessage(score) {
  const value = Number(score || 0);
  if (value === 100) return "Luar biasa! Semua jawabanmu benar dan pemahamanmu sangat kuat.";
  if (value >= 90) return "Luar biasa! Pemahamanmu sangat kuat. Pertahankan semangat belajarmu!";
  if (value >= 70) return "Bagus! Nilaimu memenuhi syarat kelulusan. Kamu siap melanjutkan materi.";
  if (value >= 50) return "Sedikit lagi! Pelajari kembali modul sebelumnya lalu coba kerjakan kembali.";
  return "Jangan menyerah. Pelajari kembali materi dan coba lagi agar pemahamanmu semakin kuat.";
}

const bank = {
  "Digital & Teknologi": [
    ["konsep dasar teknologi digital", "tujuan utama teknologi", "contoh penerapan teknologi", "pengelolaan data digital", "keamanan informasi", "kolaborasi digital", "otomasi pekerjaan", "evaluasi solusi digital", "etika penggunaan teknologi", "pengembangan keterampilan digital"],
  ],
  "UI/UX Design": [
    ["user research", "persona pengguna", "information architecture", "wireframe", "prototype", "usability testing", "user flow", "design system", "accessibility", "iterasi desain"],
  ],
  "Bisnis Manajemen": [
    ["analisis kebutuhan bisnis", "laporan keuangan", "perencanaan strategi", "analisis risiko", "pengambilan keputusan", "manajemen proyek", "pengukuran kinerja", "efisiensi proses", "komunikasi bisnis", "evaluasi hasil"],
  ],
  "Pemasaran": [
    ["target pasar", "segmentasi pelanggan", "positioning", "content marketing", "customer journey", "kampanye digital", "analisis kompetitor", "conversion rate", "retensi pelanggan", "evaluasi kampanye"],
  ],
  "Pengembangan Diri": [
    ["penetapan tujuan", "manajemen waktu", "komunikasi efektif", "berpikir kritis", "kebiasaan produktif", "motivasi belajar", "pengelolaan prioritas", "refleksi diri", "pemecahan masalah", "rencana pengembangan"],
  ],
  "Web Development": [
    ["struktur HTML", "layout CSS", "responsive design", "JavaScript", "component", "state", "routing", "API", "validasi form", "deployment"],
  ],
  "Data Analyst": [
    ["data cleaning", "data exploration", "statistik dasar", "visualisasi data", "dashboard", "SQL", "insight", "outlier", "validasi data", "presentasi hasil"],
  ],
};

const fallbackTopics = ["materi utama", "tujuan pembelajaran", "contoh kasus", "praktik", "evaluasi", "alat kerja", "proses", "hasil", "kualitas", "pengembangan" ];

function topicsFor(title) {
  const category = Object.keys(bank).find((name) => String(title).toLowerCase().includes(name.toLowerCase()));
  return bank[category]?.[0] || fallbackTopics.map((topic) => `${topic} ${title}`);
}

const phaseTemplates = {
  pretest: [
    (t, title) => `Sebelum memulai kelas ${title}, apa yang paling tepat dipahami tentang ${t}?`,
    (t) => `Manakah contoh yang paling sesuai dengan ${t}?`,
    (t) => `Tujuan utama mempelajari ${t} adalah ...`,
    (t) => `Langkah awal yang tepat ketika menerapkan ${t} adalah ...`,
    (t) => `Apa manfaat ${t} dalam pekerjaan atau proyek?`,
    (t) => `Hal yang perlu diperhatikan saat menggunakan ${t} adalah ...`,
    (t) => `Kesalahan yang sebaiknya dihindari ketika mempraktikkan ${t} adalah ...`,
    (t) => `Indikator sederhana bahwa ${t} diterapkan dengan baik adalah ...`,
    (t) => `Sikap yang paling tepat saat mempelajari ${t} adalah ...`,
    (t) => `Hasil yang diharapkan setelah memahami ${t} adalah ...`,
  ],
  quiz: [
    (t, title) => `Dalam studi kasus ${title}, keputusan terbaik terkait ${t} adalah ...`,
    (t) => `Jika terjadi masalah pada ${t}, tindakan pertama yang sebaiknya dilakukan adalah ...`,
    (t) => `Manakah pendekatan yang menghasilkan penggunaan ${t} paling efektif?`,
    (t) => `Mengapa ${t} penting dalam proses pembelajaran ${title}?`,
    (t) => `Apa hubungan ${t} dengan kualitas hasil pekerjaan?`,
    (t) => `Jika hasil belum sesuai target, bagaimana ${t} sebaiknya dievaluasi?`,
    (t) => `Contoh penerapan ${t} yang benar adalah ...`,
    (t) => `Data atau masukan apa yang paling berguna untuk memperbaiki ${t}?`,
    (t) => `Prinsip yang harus dijaga ketika menggunakan ${t} adalah ...`,
    (t) => `Kesimpulan paling tepat tentang ${t} adalah ...`,
  ],
  final: [
    (t, title) => `Kamu diminta menyelesaikan proyek ${title}. Bagaimana menerapkan ${t}?`,
    (t) => `Pada kondisi nyata, pilihan paling efektif untuk ${t} adalah ...`,
    (t) => `Jika sumber daya terbatas, prioritas pada ${t} sebaiknya ...`,
    (t) => `Bagaimana mengukur keberhasilan penerapan ${t}?`,
    (t) => `Apa risiko jika ${t} diabaikan dalam sebuah proyek?`,
    (t) => `Solusi yang paling tepat untuk meningkatkan kualitas ${t} adalah ...`,
    (t) => `Apa alasan profesional memilih pendekatan tertentu pada ${t}?`,
    (t) => `Bagaimana hasil ${t} dikomunikasikan kepada tim atau pengguna?`,
    (t) => `Langkah lanjutan setelah mengevaluasi ${t} adalah ...`,
    (t) => `Penerapan ${t} yang menunjukkan penguasaan materi adalah ...`,
  ],
};

export function quizQuestions(courseTitle, phase = "quiz") {
  const topics = topicsFor(courseTitle);
  const templates = phaseTemplates[phase] || phaseTemplates.quiz;
  const correctIndexes = [0, 1, 2, 3, 0, 1, 2, 3, 1, 0];
  return templates.map((makeQuestion, index) => {
    const correct = correctIndexes[index];
    const topic = topics[index];
    const base = [
      `Menerapkan ${topic} sesuai tujuan dan kebutuhan.`,
      `Mengikuti prinsip ${topic} dengan langkah yang terukur.`,
      `Mengabaikan konteks dan langsung menebak solusi.`,
      `Menunda penerapan ${topic} tanpa alasan yang jelas.`,
    ];
    const options = [...base];
    const desired = correct;
    // Rotate options so setiap soal memiliki susunan jawaban yang berbeda.
    const shift = (index + (phase === "pretest" ? 1 : phase === "final" ? 2 : 0)) % 4;
    const rotated = base.map((_, i) => base[(i + shift) % 4]);
    const answer = rotated.indexOf(base[desired]);
    return { id: `${phase}-${index + 1}`, question: makeQuestion(topic, courseTitle), options: rotated, answer };
  });
}

export function downloadCertificate(course, user, score) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Sertifikat ${course.title}</title><style>body{font-family:Arial,sans-serif;background:#f7fff5;padding:40px}.certificate{max-width:900px;margin:auto;background:white;border:8px solid #35c84a;padding:70px;text-align:center;border-radius:20px}.brand{color:#ffb52d;font-size:28px;font-weight:700}.title{font-size:52px;color:#087f3f;margin:30px 0 8px}.name{font-size:40px;color:#f0ae00;font-style:italic}.meta{color:#666;line-height:1.8}</style></head><body><div class="certificate"><div class="brand">videobelajar</div><div class="title">Certificate</div><h2>of Completion</h2><p>Proudly presented to</p><div class="name">${user?.nama || "Peserta"}</div><p>atas keberhasilan menyelesaikan</p><h2>${course.title}</h2><p class="meta">Nilai akhir: ${score}/100<br/>Tanggal: ${new Date().toLocaleDateString("id-ID", { day:"numeric", month:"long", year:"numeric" })}</p></div></body></html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Sertifikat-${course.title.replace(/[^a-z0-9]+/gi, "-")}.html`;
  a.click();
  URL.revokeObjectURL(url);
}
