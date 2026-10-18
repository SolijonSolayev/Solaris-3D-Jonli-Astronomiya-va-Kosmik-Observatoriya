# Xavfsizlik va Maxfiylikni Kuchaytirish Rejasi (Security & Privacy Hardening Plan)

Foydalanuvchi talabiga asosan:
1. **API kalitlari, .env va server xavfsizligini kuchaytirish:** Maxfiy ma'lumotlar auditi, server-side himoya sarlavhalari, so'rovlar soni cheklovi (rate limiting) va xavfsiz xato boshqaruvi.
2. **Kuzatuv koordinatalari va shaxsiy ma'lumotlar maxfiyligi:** Barcha foydalanuvchi koordinatalari va nuqtalari faqat brauzerning tezkor xotirasida (RAM) saqlanadi, serverga yoki uchinchi tomonlarga hech qachon yuborilmaydi va log qilinmaydi.

---

## 1. Maxfiy Ma'lumotlar va Kod Auditi (Secret Audit)

- **Tekshiruv natijalari:**
  - Ilovada hech qanday ochiq kodli API kaliti, parollar yoki foydalanuvchi shaxsiy ma'lumotlari mavjud emas.
  - `GEMINI_API_KEY` faqat server tomonida (`server.ts`) `process.env` orqali xavfsiz o'qiladi va mijoz (client-side Vite bundle) kodiga hech qachon chiqmaydi (hech qanday `VITE_` prefiksli ochiq kalit yo'q).
  - `.gitignore` faylida `.env*` to'liq himoyalangan va faqat `.env.example` shabloni mavjud.
- **Qo'shimcha tekshiruv:**
  - Barcha fayllardagi konsol jurnallari (`console.log`) tozalanadi yoki minimal xavfsiz holatga keltiriladi, server loglarida foydalanuvchi so'rovlari yoki joylashuvi qayd etilmaydi.

---

## 2. Server Xavfsizligini Kuchaytirish (`server.ts`)

- **Xavfsizlik sarlavhalari (Security Headers):**
  - `app.disable('x-powered-by')` — server texnologiyasi haqidagi ma'lumotni yashirish.
  - `X-Content-Type-Options: nosniff` — MIME-type snifflanishini oldini olish.
  - `X-Frame-Options: SAMEORIGIN` — Clickjacking hujumlaridan himoyalanish.
  - `Referrer-Policy: strict-origin-when-cross-origin` — yo'naltiruvchi URL ma'lumotlarini himoyalash.
  - `Permissions-Policy: geolocation=(), microphone=(), camera=()` — brauzer resurslarini himoyalash.
- **So'rovlar soni cheklovi (In-Memory Rate Limiting):**
  - `/api/*` endpointlari uchun har bir IP dan daqiqasiga maksimal 30 ta so'rov qabul qilish mexanizmi.
  - DoS (Denial of Service) va bot skanerlashlaridan himoya qilish.
- **Kiritish ma'lumotlarini tekshirish va tozalash (Input Sanitization):**
  - So'rovlar matni maksimal 500 belgiga qadar cheklanadi, ortiqcha yuklama yoki prompt injection urinishlari filtrlanadi.
  - JSON payload hajmi 100kb bilan cheklanadi.

---

## 3. Foydalanuvchi Maxfiyligi va Joylashuv Himoyasi (Privacy Architecture)

- **Faqat Brauzer Xotirasida (Local Memory Only):**
  - 3D globusda tanlangan nuqtalar, foydalanuvchi bosgan maxsus koordinatalar (Custom Pin) faqat React `useState` da vaqtincha saqlanadi.
  - Hech qanday `localStorage`, `sessionStorage`, `cookies` yoki uchinchi tomon tahliliy skriptlari (telemetry/analytics) ishlatilmaydi.
  - Sahifa yangilanganda yoki tab yopilganda barcha kiritilgan koordinatalar avtomatik tozalanadi.
- **Maxfiylik va Xavfsizlik Kafolati (UI Status):**
  - Foydalanuvchi ma'lumotlar oynasida (`AttributionModal.tsx`) alohida **"Maxfiylik & Xavfsizlik Siyosati" (Privacy & Security)** bo'limi qo'shiladi. Unda ma'lumotlar hech qayerga saqlanmasligi, cookie yoki kuzatuvchi kodlar yo'qligi shaffof bayon etiladi.

---

## 4. Testlash va Verifikatsiya

- `npm run lint` va `compile_applet` orqali barcha TypeScript turlari va sintaksisni sinovdan o'tkazish.
- `/api/search-grounding` va `/api/bioscience/literature` xavfsizlik cheklovlari va headerlar to'g'ri ishlayotganini tekshirish.
- Dev-serverni qayta ishga tushirib ilova barqarorligini tasdiqlash.
