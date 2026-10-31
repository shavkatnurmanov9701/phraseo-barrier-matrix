# Phraseo-Barrier Matrix — veb-sayt

**“Phraseo-Barrier Matrix”** oʻquv qoʻllanmasining elektron hamrohi.
Muallif: **Jumayeva Sadbarg Mirolimovna**. Oʻzbekiston davlat jahon tillari universiteti, Ingliz tili 3-fakulteti, 2026.

Sayt 1-kurs talabalariga (2-semestr) ingliz idiomalari, frazali feʼllar va kollokatsiyalarni 19 ta hikoya orqali oʻrganishda yordam beradi.

## Tuzilma

```
index.html            — sayt qobigʻi (header, footer)
css/style.css         — dizayn (ranglar kitob muqovasidan olingan)
css/fonts.css         — shriftlar (Archivo, Literata — oʻz serverimizda)
js/app.js             — sahifalar va marshrutlash
js/i18n.js            — interfeys matnlari (oʻzbekcha / inglizcha)
js/data/lessons.js    — 19 ta dars: lugʻat, mashqlar, video, uy vazifasi
js/data/book.js       — kitob haqida: annotatsiya, kirish, metodika
img/                  — muqova va kitobdagi hikoya sahifalari
fonts/                — shrift fayllari
```

Sayt hech qanday yigʻish (build) jarayonisiz ishlaydi. Oddiy statik fayllar, shuning uchun GitHub Pages’da toʻgʻridan-toʻgʻri ochiladi.

## Sahifalar

| Manzil | Sahifa |
|---|---|
| `#/` | Bosh sahifa: iboraning soʻzma-soʻz va asl maʼnosi, darslar matritsasi |
| `#/darslar` | 19 ta dars, tur boʻyicha filtr |
| `#/dars/5` | Bitta dars: maqsadlar, hikoya, lugʻat, mashqlar, video, uy vazifasi |
| `#/lugat` | Umumiy lugʻat: qidiruv, dars va tur boʻyicha filtr |
| `#/kitob` | Kitob haqida: annotatsiya (3 tilda), kirish, metodika |

## Kompyuterda ochib koʻrish

```bash
python3 -m http.server 8000
# keyin brauzerda: http://localhost:8000
```

## Kontentni tahrirlash

- Dars maʼlumotlari: `js/data/lessons.js`. Har bir darsda `glossary` qatori `['ibora', 'maʼnosi']` koʻrinishida.
- Interfeys matnlari: `js/i18n.js`.

## Bosqichlar

1. ✅ Tuzilma va dizayn: bosh sahifa, darslar, dars sahifasi, lugʻat, kitob haqida
2. ⏳ Namunaviy dars: interaktiv mashqlar (avtomatik tekshirish)
3. ⏳ Qolgan 18 dars, hikoya matnlari
4. ⏳ Lugʻatga oʻzbekcha muqobillar, flashcard va testlar
5. ⏳ (ixtiyoriy) Talaba progressi va oʻqituvchi paneli

## Litsenziya

Kitob matni va rasmlari muallifga tegishli. Shriftlar: Archivo va Literata (SIL Open Font License).
