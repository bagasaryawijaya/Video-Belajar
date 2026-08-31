import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL?.trim();

// Jangan membuat koneksi database yang tidak valid saat serverless function dimuat.
const sql = databaseUrl
  ? postgres(databaseUrl, {
      prepare: false,
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
    })
  : null;

export async function checkDatabase() {
  if (!sql) {
    throw new Error("DATABASE_URL belum dikonfigurasi.");
  }
  await sql`SELECT 1`;
}

export default sql;
