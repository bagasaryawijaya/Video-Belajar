import crypto from 'crypto';
import db from '../config/database.js';

const BANKS = { 'Bank BCA': '014', 'Bank BNI': '009', 'Bank BRI': '002', 'Bank Mandiri': '008' };
const WALLETS = { Dana: 'DANA', OVO: 'OVO', LinkAja: 'LINKAJA', 'Shopee Pay': 'SHOPEEPAY' };

const shortCode = () => crypto.randomBytes(5).toString('hex').toUpperCase();
const makeVa = (bank) => `${BANKS[bank] || '999'}${String(Math.floor(100000000 + Math.random() * 900000000))}`;

async function ensureUser(email, name = 'Customer') {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) throw new Error('Email pengguna wajib diisi');
  const [rows] = await db.query('SELECT user_id FROM users WHERE email=? LIMIT 1', [normalized]);
  if (rows.length) return rows[0].user_id;
  const [result] = await db.query('INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,?)', [name || 'Customer', normalized, 'local-checkout-only', 'student']);
  return result.insertId;
}

export const preparePayment = async (req, res, next) => {
  try {
    const { email, name, courseId, amount, method } = req.body;
    const numericAmount = Number(amount || 0);
    if (!email || !courseId || !method || numericAmount <= 0) return res.status(400).json({ success:false, message:'Data pembayaran belum lengkap.' });
    const userId = await ensureUser(email, name);
    const orderNumber = `VB-${Date.now()}-${shortCode()}`;
    const [order] = await db.query('INSERT INTO orders(user_id,order_number,total_amount,status) VALUES(?,?,?,?)', [userId, orderNumber, numericAmount, 'pending']);
    const [methods] = await db.query('SELECT payment_method_id FROM payment_methods WHERE provider_code=? LIMIT 1', [method]);
    if (!methods.length) return res.status(400).json({ success:false, message:'Metode pembayaran belum tersedia.' });
    const [payment] = await db.query('INSERT INTO payments(order_id,payment_method_id,amount,payment_status,transaction_id) VALUES(?,?,?,?,?)', [order.insertId, methods[0].payment_method_id, numericAmount, 'pending', `TRX-${Date.now()}-${shortCode()}`]);
    let details = { type:'card', title:'Kartu Kredit/Debit', message:'Masukkan data kartu pada halaman pembayaran.' };
    if (BANKS[method]) details = { type:'bank', bank:method, va:makeVa(method), expiresInMinutes:60, message:`Transfer ke Virtual Account ${method}.` };
    else if (WALLETS[method]) details = { type:'wallet', wallet:method, merchantCode:`VB-${shortCode()}`, qrReference:`QR-${shortCode()}`, expiresInMinutes:30, message:`Lanjutkan pembayaran melalui aplikasi ${method}.` };
    else if (method === 'card') details = { type:'card', title:'Kartu Kredit/Debit', transactionRef:`CARD-${shortCode()}`, message:'Data kartu diproses secara simulasi. Jangan menyimpan CVV di database.' };
    res.status(201).json({ success:true, data:{ paymentId:payment.insertId, orderId:order.insertId, orderNumber, amount:numericAmount, method, details } });
  } catch(e) { next(e); }
};

export const completePayment = async (req,res,next) => {
  try {
    const { paymentId, cardLast4 } = req.body;
    const [rows] = await db.query('SELECT payment_id,order_id FROM payments WHERE payment_id=? LIMIT 1',[paymentId]);
    if(!rows.length) return res.status(404).json({success:false,message:'Pembayaran tidak ditemukan'});
    await db.query("UPDATE payments SET payment_status='success', paid_at=CURRENT_TIMESTAMP, transaction_id=COALESCE(transaction_id, ?) WHERE payment_id=?",[cardLast4 ? `CARD-${cardLast4}` : `PAID-${shortCode()}`,paymentId]);
    await db.query("UPDATE orders SET status='completed' WHERE order_id=?",[rows[0].order_id]);
    res.json({success:true,data:{paymentId:Number(paymentId),status:'paid'}});
  }catch(e){next(e);}
};
