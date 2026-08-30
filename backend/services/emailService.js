import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  const host = String(process.env.SMTP_HOST || "").trim();
  const user = String(process.env.SMTP_USER || "").trim();
  // Google App Password sering disalin dalam format "xxxx xxxx xxxx xxxx".
  // Spasi harus dihapus sebelum dikirim sebagai kredensial SMTP.
  const password = String(process.env.SMTP_PASSWORD || "").replace(/\s+/g, "");

  if (!host || !user || !password) {
    throw new Error("SMTP belum dikonfigurasi. Isi SMTP_HOST, SMTP_USER, dan SMTP_PASSWORD dengan Google App Password.");
  }

  if (password.includes("GANTI_DENGAN") || password.includes("PASTE_16_CHAR")) {
    throw new Error("SMTP_PASSWORD masih berupa placeholder. Buat Google App Password 16 karakter dan masukkan tanpa spasi ke backend/.env.");
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false").toLowerCase() === "true",
    requireTLS: Number(process.env.SMTP_PORT || 587) === 587,
    auth: {
      user,
      pass: password,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return transporter;
}

export async function sendVerificationEmail({ to, name, code, token }) {
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const verifyUrl = `${frontendUrl}/verify-email?token=${encodeURIComponent(token)}`;

  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Verifikasi akun Video Belajar",
    text: [
      `Halo ${name || "Pengguna"},`,
      "",
      `Kode verifikasi akun Anda: ${code}`,
      "",
      `Atau buka link berikut untuk verifikasi: ${verifyUrl}`,
      "",
      "Kode berlaku 5 menit.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Verifikasi Akun Video Belajar</h2>
        <p>Halo ${name || "Pengguna"},</p>
        <p>Kode verifikasi Anda:</p>
        <h1 style="letter-spacing:6px">${code}</h1>
        <p>Kode berlaku selama 5 menit.</p>
        <p><a href="${verifyUrl}">Verifikasi email sekarang</a></p>
      </div>
    `,
  });
}


export async function sendPasswordResetCodeEmail({ to, name, code }) {
  await getTransporter().sendMail({
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    to,
    subject: "Kode Reset Password Video Belajar",
    text: [
      `Halo ${name || "Pengguna"},`,
      "",
      `Kode verifikasi untuk reset password Anda: ${code}`,
      "",
      "Kode berlaku selama 5 menit.",
      "Jika Anda tidak meminta reset password, abaikan email ini.",
    ].join("\n"),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;max-width:560px;margin:auto">
        <h2>Reset Password Video Belajar</h2>
        <p>Halo ${name || "Pengguna"},</p>
        <p>Gunakan kode berikut untuk melanjutkan reset password:</p>
        <div style="font-size:32px;font-weight:700;letter-spacing:8px;margin:24px 0">${code}</div>
        <p>Kode berlaku selama <strong>5 menit</strong>.</p>
        <p style="color:#777">Jika Anda tidak meminta reset password, abaikan email ini.</p>
      </div>
    `,
  });
}


export async function verifySmtpConnection() {
  const transport = getTransporter();
  try {
    await transport.verify();
    return { success: true, message: "SMTP Gmail berhasil terhubung dan kredensial diterima." };
  } catch (error) {
    if (error?.responseCode === 535 || String(error?.message || "").includes("535")) {
      throw new Error(
        "Gmail menolak kredensial SMTP (535). Pastikan Verifikasi 2 Langkah aktif dan SMTP_PASSWORD berisi Google App Password 16 karakter, bukan password Gmail biasa, tanpa spasi."
      );
    }
    throw error;
  }
}
