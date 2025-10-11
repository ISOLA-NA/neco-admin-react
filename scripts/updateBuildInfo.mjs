// scripts/updateBuildInfo.mjs
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildInfoPath = path.resolve(__dirname, '../build-info.json');

// تاریخ امروز (Europe/Berlin) به فرمت YYYY-MM-DD
const formatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Berlin',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const [{ value: y }, , { value: m }, , { value: d }] = formatter.formatToParts(new Date());
const today = `${y}-${m}-${d}`;

let data = { date: '', sequence: 0 };
if (fs.existsSync(buildInfoPath)) {
  try {
    data = JSON.parse(fs.readFileSync(buildInfoPath, 'utf-8'));
  } catch {
    data = { date: '', sequence: 0 };
  }
}

const prevDate = data.date;
const hasManualSeq = (process.env.VITE_VERSION_SEQ || '').trim() !== '';

// تاریخ همیشه آپدیت بشه
data.date = today;

// اگر نسخه دستی **نداری**، آنگاه شمارنده را مثل قبل مدیریت کن
if (!hasManualSeq) {
  if (prevDate === today) {
    data.sequence = (Number(data.sequence) || 0) + 1;
  } else {
    data.sequence = 1;
  }
} // اگر دستی داری، sequence رو دست نمی‌زنیم

fs.writeFileSync(buildInfoPath, JSON.stringify(data, null, 2), 'utf-8');

if (hasManualSeq) {
  console.log(`Date updated to ${data.date}. Manual sequence in use (VITE_VERSION_SEQ).`);
} else {
  console.log(`Build info updated: ${data.date}-version ${data.sequence}`);
}
