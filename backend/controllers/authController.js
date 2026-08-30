import crypto from "crypto";
import admin, { firestore } from "../config/firebase.js";
import {
  hashPassword,
  comparePassword,
  createAccessToken,
  createEmailVerificationToken,
  verifyJwt,
  createPasswordResetToken,
} from "../utils/auth.js";
import { sendVerificationEmail, sendPasswordResetCodeEmail } from "../services/emailService.js";

const users = () => firestore.collection("users");

function publicUser(data) {
  return {
    id: data.id,
    nama: data.nama,
    email: data.email,
    phone: data.phone || "",
    role: data.role || "student",
    emailVerified: Boolean(data.emailVerified),
    profileImage: data.profileImage || "",
  };
}

export async function signup(req, res, next) {
  try {
    const { nama, email, phone = "", password } = req.body;

    if (!nama?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, dan password wajib diisi.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password minimal 6 karakter.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await users().where("email", "==", normalizedEmail).limit(1).get();

    if (!existing.empty) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar.",
      });
    }

    const id = crypto.randomUUID();
    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = await hashPassword(code);
    const passwordHash = await hashPassword(password);

    const user = {
      id,
      nama: nama.trim(),
      email: normalizedEmail,
      phone: String(phone || ""),
      passwordHash,
      role: "student",
      profileImage: "",
      emailVerified: false,
      verificationCodeHash: codeHash,
      verificationCodeExpiresAt: Date.now() + 5 * 60 * 1000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await users().doc(id).set(user);

    try {
      const token = createEmailVerificationToken(user);
      await sendVerificationEmail({
        to: normalizedEmail,
        name: nama.trim(),
        code,
        token,
      });
    } catch (mailError) {
      await users().doc(id).delete().catch(() => {});
      throw new Error(`Akun belum dibuat karena email verifikasi gagal dikirim. ${mailError.message}`);
    }

    return res.status(201).json({
      success: true,
      message: "Akun berhasil dibuat. Kode verifikasi telah dikirim ke email.",
      data: { id, email: normalizedEmail },
    });
  } catch (error) {
    next(error);
  }
}

export async function resendVerificationCode(req, res, next) {
  try {
    const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: "Email wajib diisi." });
    }

    const snapshot = await users().where("email", "==", normalizedEmail).limit(1).get();
    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    const doc = snapshot.docs[0];
    const user = doc.data();
    if (user.emailVerified) {
      return res.json({ success: true, message: "Email sudah terverifikasi." });
    }

    const code = String(crypto.randomInt(100000, 1000000));
    await doc.ref.update({
      verificationCodeHash: await hashPassword(code),
      verificationCodeExpiresAt: Date.now() + 5 * 60 * 1000,
      updatedAt: new Date().toISOString(),
    });

    try {
      const token = createEmailVerificationToken(user);
      await sendVerificationEmail({ to: normalizedEmail, name: user.nama, code, token });
    } catch (mailError) {
      throw new Error(`Kode verifikasi gagal dikirim. ${mailError.message}`);
    }

    return res.json({ success: true, message: "Kode verifikasi baru telah dikirim ke email." });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token wajib diisi." });
    }

    let decoded;
    try {
      decoded = verifyJwt(token);
    } catch {
      return res.status(400).json({
        success: false,
        message: "Token verifikasi tidak valid atau sudah kedaluwarsa.",
      });
    }

    if (decoded.type !== "email_verification") {
      return res.status(400).json({
        success: false,
        message: "Token bukan token verifikasi email.",
      });
    }

    const ref = users().doc(decoded.sub);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    await ref.update({
      emailVerified: true,
      verificationCodeHash: null,
      verificationCodeExpiresAt: null,
      updatedAt: new Date().toISOString(),
    });

    return res.json({
      success: true,
      message: "email verified successfully",
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyCode(req, res, next) {
  try {
    const { email, code } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    const snapshot = await users().where("email", "==", normalizedEmail).limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    const doc = snapshot.docs[0];
    const user = doc.data();

    if (user.emailVerified) {
      return res.json({ success: true, message: "Email sudah terverifikasi." });
    }

    if (!user.verificationCodeExpiresAt || Date.now() > user.verificationCodeExpiresAt) {
      return res.status(400).json({ success: false, message: "Kode verifikasi sudah kedaluwarsa." });
    }

    const valid = await comparePassword(String(code || ""), user.verificationCodeHash);

    if (!valid) {
      return res.status(400).json({ success: false, message: "Kode verifikasi salah." });
    }

    await doc.ref.update({
      emailVerified: true,
      verificationCodeHash: null,
      verificationCodeExpiresAt: null,
      updatedAt: new Date().toISOString(),
    });

    return res.json({ success: true, message: "email verified successfully" });
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: "Email wajib diisi." });
    }

    const snapshot = await users().where("email", "==", normalizedEmail).limit(1).get();

    // Jangan membocorkan apakah email terdaftar. Untuk development, tetap kirim status generik.
    if (snapshot.empty) {
      return res.json({
        success: true,
        message: "Jika email terdaftar, kode reset password telah dikirim.",
      });
    }

    const doc = snapshot.docs[0];
    const user = doc.data();
    const code = String(crypto.randomInt(100000, 1000000));
    const codeHash = await hashPassword(code);

    await doc.ref.update({
      resetCodeHash: codeHash,
      resetCodeExpiresAt: Date.now() + 5 * 60 * 1000,
      updatedAt: new Date().toISOString(),
    });

    try {
      await sendPasswordResetCodeEmail({
        to: normalizedEmail,
        name: user.nama,
        code,
      });
    } catch (mailError) {
      await doc.ref.update({
        resetCodeHash: null,
        resetCodeExpiresAt: null,
        updatedAt: new Date().toISOString(),
      }).catch(() => {});
      throw new Error(`Kode reset gagal dikirim. ${mailError.message}`);
    }

    return res.json({
      success: true,
      message: "Kode verifikasi reset password telah dikirim ke email.",
      data: { email: normalizedEmail },
    });
  } catch (error) {
    next(error);
  }
}

export async function verifyResetCode(req, res, next) {
  try {
    const normalizedEmail = String(req.body?.email || "").trim().toLowerCase();
    const code = String(req.body?.code || "").trim();

    if (!normalizedEmail || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ success: false, message: "Email dan kode 6 digit wajib diisi." });
    }

    const snapshot = await users().where("email", "==", normalizedEmail).limit(1).get();
    if (snapshot.empty) {
      return res.status(400).json({ success: false, message: "Kode verifikasi salah atau sudah kedaluwarsa." });
    }

    const doc = snapshot.docs[0];
    const user = doc.data();

    if (!user.resetCodeHash || !user.resetCodeExpiresAt || Date.now() > user.resetCodeExpiresAt) {
      return res.status(400).json({ success: false, message: "Kode verifikasi sudah kedaluwarsa. Silakan minta kode baru." });
    }

    const valid = await comparePassword(code, user.resetCodeHash);
    if (!valid) {
      return res.status(400).json({ success: false, message: "Kode verifikasi salah." });
    }

    const resetToken = createPasswordResetToken(user);

    return res.json({
      success: true,
      message: "Kode benar. Silakan buat password baru.",
      data: { resetToken },
    });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { resetToken, password, confirmPassword } = req.body || {};

    if (!resetToken || !password || !confirmPassword) {
      return res.status(400).json({ success: false, message: "Token dan password baru wajib diisi." });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password minimal 6 karakter." });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: "Password dan konfirmasi password harus sama." });
    }

    let decoded;
    try {
      decoded = verifyJwt(resetToken);
    } catch {
      return res.status(400).json({ success: false, message: "Sesi reset password tidak valid atau sudah kedaluwarsa." });
    }

    if (decoded.type !== "password_reset") {
      return res.status(400).json({ success: false, message: "Token reset password tidak valid." });
    }

    const ref = users().doc(decoded.sub);
    const snapshot = await ref.get();
    if (!snapshot.exists) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    const user = snapshot.data();
    if (!user.resetCodeHash || !user.resetCodeExpiresAt || Date.now() > user.resetCodeExpiresAt) {
      return res.status(400).json({ success: false, message: "Kode reset sudah kedaluwarsa. Silakan mulai lagi." });
    }

    await ref.update({
      passwordHash: await hashPassword(password),
      resetCodeHash: null,
      resetCodeExpiresAt: null,
      updatedAt: new Date().toISOString(),
    });

    return res.json({ success: true, message: "Password berhasil diubah. Silakan login kembali." });
  } catch (error) {
    next(error);
  }
}

export async function googleLogin(req, res, next) {
  try {
    const idToken = String(req.body?.idToken || "").trim();
    if (!idToken) {
      return res.status(400).json({ success: false, message: "Google ID token wajib diisi." });
    }

    const decoded = await admin.auth().verifyIdToken(idToken);
    const email = String(decoded.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Akun Google tidak memiliki email." });
    }

    const snapshot = await users().where("email", "==", email).limit(1).get();
    let user;

    if (snapshot.empty) {
      const id = String(decoded.uid || crypto.randomUUID());
      user = {
        id,
        firebaseUid: decoded.uid,
        nama: decoded.name || email.split("@")[0],
        email,
        phone: decoded.phone_number || "",
        passwordHash: null,
        role: "student",
        profileImage: decoded.picture || "",
        emailVerified: true,
        authProvider: "google",
        verificationCodeHash: null,
        verificationCodeExpiresAt: null,
        resetCodeHash: null,
        resetCodeExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await users().doc(id).set(user);
    } else {
      const doc = snapshot.docs[0];
      user = doc.data();
      user = {
        ...user,
        firebaseUid: decoded.uid,
        nama: user.nama || decoded.name || email.split("@")[0],
        profileImage: user.profileImage || decoded.picture || "",
        emailVerified: true,
        authProvider: "google",
        updatedAt: new Date().toISOString(),
      };
      await doc.ref.update(user);
    }

    const token = createAccessToken(user);
    return res.json({
      success: true,
      message: "Login dengan Google berhasil.",
      data: { token, user: publicUser(user) },
    });
  } catch (error) {
    console.error("Google login:", error);
    return res.status(401).json({ success: false, message: "Login dengan Google gagal. Pastikan konfigurasi Firebase Google Sign-In sudah benar." });
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    const snapshot = await users().where("email", "==", normalizedEmail).limit(1).get();

    if (snapshot.empty) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah.",
      });
    }

    const user = snapshot.docs[0].data();
    const valid = await comparePassword(String(password || ""), user.passwordHash);

    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah.",
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Email belum diverifikasi. Silakan cek email Anda.",
      });
    }

    const token = createAccessToken(user);

    return res.json({
      success: true,
      message: "Login berhasil.",
      data: {
        token,
        user: publicUser(user),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const snapshot = await users().doc(req.user.sub).get();

    if (!snapshot.exists) {
      return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
    }

    res.json({ success: true, data: publicUser(snapshot.data()) });
  } catch (error) {
    next(error);
  }
}


export async function ensureDefaultAdminAccounts() {
  const defaults = [
    {
      envEmail: "ADMIN_EMAIL",
      envPassword: "ADMIN_PASSWORD",
      role: "admin",
      nama: "Administrator",
    },
    {
      envEmail: "SUPER_ADMIN_EMAIL",
      envPassword: "SUPER_ADMIN_PASSWORD",
      role: "superadmin",
      nama: "Super Administrator",
    },
  ];

  for (const item of defaults) {
    const email = process.env[item.envEmail]?.trim().toLowerCase();
    const password = process.env[item.envPassword];

    if (!email || !password) continue;

    const snapshot = await users().where("email", "==", email).limit(1).get();

    if (snapshot.empty) {
      const id = crypto.randomUUID();
      await users().doc(id).set({
        id,
        nama: item.nama,
        email,
        phone: "",
        passwordHash: await hashPassword(password),
        role: item.role,
        profileImage: "",
        emailVerified: true,
        verificationCodeHash: null,
        verificationCodeExpiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
}
