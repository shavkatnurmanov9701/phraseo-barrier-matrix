// Interfeys matnlari: o'zbekcha (asosiy) va inglizcha.

const STRINGS = {
  uz: {
    'nav.home': 'Bosh sahifa',
    'nav.lessons': 'Darslar',
    'nav.glossary': 'Lugʻat',
    'nav.about': 'Kitob haqida',
    'nav.menu': 'Menyu',
    'lang.switch': 'Tilni almashtirish',

    'hero.kicker': 'Ingliz tili frazeologiyasi — 1-kurs, 2-semestr',
    'hero.literal': 'Soʻzma-soʻz',
    'hero.actual': 'Aslida',
    'hero.reveal': 'Maʼnosini ochish',
    'hero.hide': 'Yopish',
    'hero.next': 'Boshqa ibora',
    'hero.fromLesson': (n) => `${n}-darsdan`,
    'hero.lead': 'Idioma — soʻzlari bir narsani, maʼnosi esa butunlay boshqa narsani aytadigan ibora. Bu sayt kitobdagi 19 ta hikoya orqali shu toʻsiqdan oʻtishga yordam beradi.',
    'hero.start': 'Darslarni boshlash',
    'hero.glossary': 'Lugʻatni ochish',

    'home.matrixTitle': 'Darslar matritsasi',
    'home.matrixLead': (l, e) => `${l} ta hikoya, ${e} ta ibora. Har bir katakda dars mavzusi va undagi iboralardan namunalar.`,
    'home.flowTitle': 'Har bir dars qanday tuzilgan',
    'home.flowLead': 'Kitobdagi har bir dars bir xil yoʻldan boradi: iborani kontekstda koʻrish, mashq qilish va oʻz nutqingizda qoʻllash.',
    'home.searchTitle': 'Iborani qidiring',
    'home.searchLead': 'Barcha darslardagi iboralar bitta lugʻatda: maʼnosi va qaysi darsda uchrashi bilan.',
    'home.searchPh': 'Masalan: piece of cake',
    'home.searchBtn': 'Qidirish',
    'home.aboutTitle': 'Kitob haqida',
    'home.aboutMore': 'Batafsil',

    'filter.all': 'Hammasi',
    'lessons.title': 'Darslar',
    'lessons.lead': 'Kitobdagi 19 ta hikoya. Har biri bir mavzu va 6–20 ta ibora atrofida qurilgan.',
    'lessons.count': (n) => `${n} ta ibora`,
    'lessons.empty': 'Bu turda dars topilmadi.',

    'lesson.label': (n) => `${n}-dars`,
    'lesson.inBook': (s, p) => `Kitobda: ${s}, ${p}-bet`,
    'lesson.objectives': 'Dars maqsadlari',
    'lesson.objectivesLead': 'Dars yakunida talaba:',
    'lesson.story': 'Hikoya',
    'lesson.storyPoster': 'Kitobdagi hikoya sahifasi. Kattalashtirib oʻqish uchun rasm ustiga bosing.',
    'lesson.open': 'Kattalashtirish',
    'lesson.close': 'Yopish',
    'lesson.glossary': 'Dars lugʻati',
    'lesson.activities': 'Mashqlar',
    'lesson.activitiesNote': 'Mashqlar keyingi bosqichda interaktiv boʻladi: javoblar shu yerda tekshiriladi.',
    'lesson.soon': 'Tez orada',
    'lesson.video': 'Video topshiriq',
    'lesson.videoPlay': 'Videoni qoʻyish',
    'lesson.videoOpen': 'YouTube’da ochish',
    'lesson.noVideo': 'Bu darsda video topshiriq yoʻq.',
    'lesson.homework': 'Uy vazifasi',
    'lesson.prev': 'Oldingi dars',
    'lesson.next': 'Keyingi dars',
    'lesson.all': 'Barcha darslar',
    'lesson.notFound': 'Bunday dars yoʻq. Darslar roʻyxatidan tanlang.',

    'glossary.title': 'Lugʻat',
    'glossary.lead': (n) => `Kitobdagi ${n} ta ibora va birikma. Inglizcha maʼnolari kitobdan olingan; oʻzbekcha muqobillar keyingi bosqichda qoʻshiladi.`,
    'glossary.search': 'Iborani yoki maʼnosini yozing',
    'glossary.lesson': 'Dars',
    'glossary.allLessons': 'Barcha darslar',
    'glossary.found': (n) => `${n} ta natija`,
    'glossary.empty': 'Hech narsa topilmadi. Soʻzni qisqartirib yoki boshqa darsni tanlab koʻring.',
    'glossary.clear': 'Filtrni tozalash',

    'about.title': 'Kitob haqida',
    'about.author': 'Muallif',
    'about.reviewers': 'Taqrizchilar',
    'about.annotation': 'Annotatsiya',
    'about.intro': 'Kirish',
    'about.aims': 'Kitobning maqsadlari',
    'about.features': 'Frazeologik birliklarning asosiy belgilari',
    'about.why': 'Nega aynan matn orqali?',
    'about.types': 'Mashq turlari',
    'about.tips': 'Oʻqituvchiga maslahatlar',
    'about.note': 'Inglizcha matnlar kitobdan oʻzgarishsiz olingan.',

    'footer.made': 'Oʻquv qoʻllanmaning elektron hamrohi',
  },
  en: {
    'nav.home': 'Home',
    'nav.lessons': 'Lessons',
    'nav.glossary': 'Glossary',
    'nav.about': 'About the book',
    'nav.menu': 'Menu',
    'lang.switch': 'Switch language',

    'hero.kicker': 'English phraseology — Year 1, Semester 2',
    'hero.literal': 'Word for word',
    'hero.actual': 'What it means',
    'hero.reveal': 'Show the meaning',
    'hero.hide': 'Hide',
    'hero.next': 'Another idiom',
    'hero.fromLesson': (n) => `From lesson ${n}`,
    'hero.lead': 'An idiom says one thing with its words and means something else entirely. This site helps you cross that barrier through the 19 stories of the book.',
    'hero.start': 'Start the lessons',
    'hero.glossary': 'Open the glossary',

    'home.matrixTitle': 'The lesson matrix',
    'home.matrixLead': (l, e) => `${l} stories, ${e} expressions. Each cell shows the topic and a few of its expressions.`,
    'home.flowTitle': 'How each lesson works',
    'home.flowLead': 'Every lesson in the book follows the same path: meet the expressions in context, practise them, then use them yourself.',
    'home.searchTitle': 'Look up an expression',
    'home.searchLead': 'Every expression from every lesson in one glossary, with its meaning and the lesson it comes from.',
    'home.searchPh': 'For example: piece of cake',
    'home.searchBtn': 'Search',
    'home.aboutTitle': 'About the book',
    'home.aboutMore': 'Read more',

    'filter.all': 'All',
    'lessons.title': 'Lessons',
    'lessons.lead': 'The 19 stories of the book. Each is built around one theme and 6–20 expressions.',
    'lessons.count': (n) => `${n} expressions`,
    'lessons.empty': 'No lessons of this type.',

    'lesson.label': (n) => `Lesson ${n}`,
    'lesson.inBook': (s, p) => `In the book: ${s}, p. ${p}`,
    'lesson.objectives': 'Lesson objectives',
    'lesson.objectivesLead': 'By the end of the lesson, students will be able to:',
    'lesson.story': 'Story',
    'lesson.storyPoster': 'The story page from the book. Tap the image to read it full size.',
    'lesson.open': 'Enlarge',
    'lesson.close': 'Close',
    'lesson.glossary': 'Lesson glossary',
    'lesson.activities': 'Activities',
    'lesson.activitiesNote': 'In the next stage these become interactive, with answers checked right here.',
    'lesson.soon': 'Coming soon',
    'lesson.video': 'Video task',
    'lesson.videoPlay': 'Play the video',
    'lesson.videoOpen': 'Open on YouTube',
    'lesson.noVideo': 'This lesson has no video task.',
    'lesson.homework': 'Homework',
    'lesson.prev': 'Previous lesson',
    'lesson.next': 'Next lesson',
    'lesson.all': 'All lessons',
    'lesson.notFound': 'There is no such lesson. Pick one from the list.',

    'glossary.title': 'Glossary',
    'glossary.lead': (n) => `${n} expressions and collocations from the book. English meanings come from the book; Uzbek equivalents are added in a later stage.`,
    'glossary.search': 'Type an expression or a meaning',
    'glossary.lesson': 'Lesson',
    'glossary.allLessons': 'All lessons',
    'glossary.found': (n) => `${n} results`,
    'glossary.empty': 'Nothing found. Try a shorter word or another lesson.',
    'glossary.clear': 'Clear filters',

    'about.title': 'About the book',
    'about.author': 'Author',
    'about.reviewers': 'Reviewers',
    'about.annotation': 'Annotation',
    'about.intro': 'Introduction',
    'about.aims': 'Aims of the book',
    'about.features': 'Key features of phraseological units',
    'about.why': 'Why teach through texts?',
    'about.types': 'Exercise types',
    'about.tips': 'Teaching tips',
    'about.note': 'English texts are reproduced from the book unchanged.',

    'footer.made': 'The online companion to the study guide',
  },
};

function readLang() {
  try { return localStorage.getItem('pbm-lang') || 'uz'; } catch { return 'uz'; }
}

let lang = readLang();
if (!STRINGS[lang]) lang = 'uz';

export function getLang() { return lang; }

export function setLang(next) {
  lang = STRINGS[next] ? next : 'uz';
  try { localStorage.setItem('pbm-lang', lang); } catch { /* storage unavailable */ }
  document.documentElement.lang = lang;
}

export function t(key, ...args) {
  const v = STRINGS[lang][key] ?? STRINGS.uz[key] ?? key;
  return typeof v === 'function' ? v(...args) : v;
}

// {uz, en} obyektidan joriy tildagi qiymat
export function pick(obj) {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] ?? obj.uz ?? obj.en ?? '';
}
