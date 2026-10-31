# phrasebar — “Phraseo-Barrier Matrix” veb-sayti

**“Phraseo-Barrier Matrix”** o‘quv qo‘llanmasining elektron hamrohi.
Muallif: **Jumayeva Sadbarg Mirolimovna**. O‘zbekiston davlat jahon tillari universiteti, Ingliz tili 3-fakulteti, 2026.

Sayt 1-kurs talabalariga (2-semestr) ingliz idiomalari, frazali fe’llar va kollokatsiyalarni 19 ta hikoya orqali o‘rganishda yordam beradi.

## Tuzilma

```
index.html            — sayt qobig‘i (header, footer)
css/style.css         — dizayn (oq fon, kulrang kartochkalar, rangli bloklar)
css/fonts.css         — shrift (Inter Tight — o‘z serverimizda)
js/art.js             — SVG illyustratsiyalar
js/icons.js           — Lucide ikonkalari
js/practice.js        — interaktiv mashqlar mexanizmi
js/data/practice/     — darslar bo‘yicha mashqlar (l01.js, set_a/b/c.js, kit.js)
js/app.js             — sahifalar va marshrutlash
js/i18n.js            — interfeys matnlari (o‘zbekcha / inglizcha)
js/data/lessons.js    — 19 ta dars: lug‘at, mashqlar, video, uy vazifasi
js/data/book.js       — kitob haqida: annotatsiya, kirish, metodika
img/                  — muqova va kitobdagi hikoya sahifalari
fonts/                — shrift fayllari
```

Sayt hech qanday yig‘ish (build) jarayonisiz ishlaydi. Oddiy statik fayllar, shuning uchun GitHub Pages’da to‘g‘ridan-to‘g‘ri ochiladi.

## Sahifalar

| Manzil | Sahifa |
|---|---|
| `#/` | Bosh sahifa: iboraning so‘zma-so‘z va asl ma’nosi, darslar matritsasi |
| `#/darslar` | 19 ta dars, tur bo‘yicha filtr |
| `#/dars/5` | Bitta dars: maqsadlar, hikoya, lug‘at, mashqlar, video, uy vazifasi |
| `#/lugat` | Umumiy lug‘at: qidiruv, dars va tur bo‘yicha filtr |
| `#/kitob` | Kitob haqida: annotatsiya (3 tilda), kirish, metodika |

## Kompyuterda ochib ko‘rish

```bash
python3 -m http.server 8000
# keyin brauzerda: http://localhost:8000
```

## Kontentni tahrirlash

- Dars ma’lumotlari: `js/data/lessons.js`. Har bir darsda `glossary` qatori `['ibora', 'ma’nosi']` ko‘rinishida.
- Interfeys matnlari: `js/i18n.js`.

## Bosqichlar

1. ✅ Tuzilma va dizayn: bosh sahifa, darslar, dars sahifasi, lug‘at, kitob haqida
2. ✅ 1-dars: interaktiv mashqlar (avtomatik tekshirish, yozma ishlar, natijalar saqlanadi)
3. ✅ Qolgan 18 dars ham interaktiv (Warm-up + avtomatik tekshiriladigan mashqlar)
4. ⏳ Lug‘atga o‘zbekcha muqobillar, flashcard va testlar
5. ⏳ (ixtiyoriy) Talaba progressi va o‘qituvchi paneli

## Litsenziya

Kitob matni va rasmlari muallifga tegishli. Shrift: Inter Tight (SIL Open Font License). Ikonkalar: Lucide (ISC).
