# Solaris 3D: Jonli Astronomiya va Kosmik Observatoriya

Solaris 3D — Yer, Oy va Quyoshning real-vaqt harakatini, tutilish yo‘llarini va kosmik observatoriya ma’lumotlarini interaktiv 3D ko‘rinishda ko‘rsatadigan loyiha.

U quyidagilarni taqdim etadi:
- real-vaqt astronomik hisob-kitoblar
- 3D Yer/Quyosh/Oy vizualizatsiyasi
- kuzatuv stansiyalari bo‘yicha telemetriya
- tutilish va totality effektlari
- ilmiy ma’lumotlar grounding va fallback mexanizmi

## Xususiyatlar

- 3D globe va osmon maydoni
- Quyosh balandligi, azimuti va oy fazasi
- Kuzatuv nuqtalari bo‘yicha tanlash
- Vaqtni siljitish va jonli soat rejimi
- Tutilish effektlarini vizualizatsiya qilish
- Mobil va desktop uchun moslashuvchan UI
- Server tomonidagi ilmiy ma’lumotlar API
- Gemini API mavjud bo‘lmasa fallback javoblar

## Texnologiyalar

- React + TypeScript
- Vite
- Three.js
- Express
- Google GenAI (Gemini)
- CSS / UI komponentlar

## Loyihani tuzilishi

```text
.
├── server.ts
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   ├── data/
│   ├── utils/
│   ├── types.ts
│   └── index.css
├── .env.example
├── metadata.json
└── README.md
```

## Boshlash

### Talablar
- Node.js 18+
- npm yoki bun

### O‘rnatish

```bash
npm install
```

yoki

```bash
bun install
```

### Muhit o‘zgaruvchilari

```bash
cp .env.example .env
```

`.env` ichiga quyidagilarni qo‘shing:

```env
PORT=3000
GEMINI_API_KEY=your_key_here
NODE_ENV=development
```

### Ishga tushirish

```bash
npm run dev
```

So‘ngra brauzerda:

```text
http://localhost:3000
```

## Ishlab chiqarish

```bash
npm run build
NODE_ENV=production npm start
```

## API

Loyiha serverda bir nechta endpointlarni taqdim etadi:

- `POST /api/search-grounding` — ilmiy grounding
- `GET /api/bioscience/literature` — bioscience maqolalar
- `GET /api/security-status` — xavfsizlik va holat

## Maqsad

Bu loyiha astronomiya, ilmiy ta’lim va observatoriya rejalashtirish uchun mo‘ljallangan. U foydalanuvchiga Quyosh tutilishi va kosmik hodisalar haqida real-vaqt, vizual va interaktiv tushuncha beradi.

## Litsenziya

Ushbu loyiha hozircha aniq litsenziya fayliga ega bo‘lmagan bo‘lishi mumkin. Agar litsenziya qo‘shilmasa, repo default holda litsenziyasiz deb qaraladi.

## Hissa qo‘shish

1. Fork qiling
2. Feature branch yarating
3. O‘zgarishlarni kiritib, test qiling
4. Pull Request yuboring

## Muallif

Loyiha egasi va hissa qo‘shuvchilar tomonidan rivojlantirilmoqda.

---

Agar xohlasangiz, men README ni qisqartirilgan "landing" versiyasini yoki inglizcha tarjimasini ham push qilib bera olaman.
