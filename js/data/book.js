// Kitob haqidagi umumiy ma'lumotlar (kirish qismi, annotatsiya, metodika).

export const BOOK = {
  title: 'Phraseo-Barrier Matrix',
  subtitle: 'Study Guide for First-Year Students (Second Semester)',
  author: 'Jumayeva Sadbarg Mirolimovna',
  authorShort: 'S. Jumayeva',
  university: {
    uz: 'O‘zbekiston davlat jahon tillari universiteti, Ingliz tili 3-fakulteti',
    en: 'Uzbekistan State World Languages University, English Faculty 3',
  },
  program: {
    uz: '60111800 — Xorijiy til va adabiyoti (ingliz tili) ta’lim yo‘nalishi talabalari uchun',
    en: 'For students of 60111800 — Foreign Language and Literature (English)',
  },
  city: { uz: 'Toshkent, 2026', en: 'Tashkent, 2026' },
  reviewers: [
    { name: 'Isakulova Nilufar Janikulovna', role: { uz: 'Pedagogika va psixologiya kafedrasi, p.f.d. (DSc)', en: 'Department of Pedagogy and Psychology, DSc' } },
    { name: 'Komilova Gulmira Olimovna', role: { uz: 'PhD, dotsent', en: 'PhD, Associate Professor' } },
  ],
  annotation: {
    uz: 'Ushbu “Phraseo-Barrier Matrix” mashqlar kitobi xorijiy til o‘rganuvchi talabalarga frazeologik birliklarni kontekstda o‘zlashtirishlariga yordam berish maqsadida tuzilgan. Materiallar frazeologik birliklarning haqiqiy nutqda qo‘llanilishi va madaniy o‘ziga xosliklarini aks ettiruvchi autentik matnlarga asoslangan. Ushbu mashqlar kitobi talabalarning o‘qish, tushunish va kommunikativ kompetensiyasini rivojlantirishga xizmat qilib, frazeologik birliklarni anglash, o‘rganish, bilish va ularni og‘zaki va yozma nutqda faol qo‘llash bosqichigacha yo‘naltirilgan. Kitob universitet talabalari, o‘qituvchilar va mustaqil o‘rganuvchilar uchun mo‘ljallangan.',
    en: 'This exercise book “Phraseo-Barrier Matrix” is designed to help foreign language learners master phraseological units in context. The materials are based on authentic texts that reflect the real use and cultural peculiarities of phraseological expressions. This exercise book aims to develop students’ reading, comprehension, and communicative competence, guiding them through the stages of understanding, learning, acquiring, and actively using phraseological units in both oral and written speech. The book is intended for university students, teachers, and independent learners.',
    ru: 'Учебное пособие “Phraseo-Barrier Matrix” предназначено для помощи студентам, изучающим иностранные языки, в освоении фразеологических единиц в контексте. Материалы основаны на аутентичных текстах, отражающих реальное употребление и культурные особенности фразеологических выражений. Данное пособие направлено на развитие навыков чтения, понимания и коммуникативной компетенции студентов, а также ориентирует их на этапы осмысления, изучения, усвоения и активного использования фразеологических единиц в устной и письменной речи. Книга рассчитана на студентов университетов, преподавателей и самостоятельных изучающих.',
  },
  introduction: [
    'Phraseological units, commonly known as idioms, proverbs, and set expressions, form an essential part of any language. They embody not only linguistic structures but also the cultural values, traditions, and worldview of a speech community. For learners of a foreign language, acquiring phraseological competence is often one of the most challenging yet rewarding aspects of language learning. While traditional vocabulary teaching methods focus on single words, phraseological units require a deeper understanding of figurative meaning, cultural context, and usage in authentic discourse.',
    'Recent research highlights that text-based approaches effectively develop phraseological competence by presenting idioms in natural, meaningful contexts. Through engaging with texts, learners understand both linguistic features and sociocultural aspects of phraseological units, promoting authentic language use rather than memorization.',
    'Each unit of the book follows a progressive structure, moving from presentation of phraseological units in context, through practice exercises for comprehension and accuracy, to production tasks that encourage learners to creatively apply idioms in spoken and written communication. By integrating these steps, the book reflects modern methodological models such as the Presentation–Practice–Production (PPP) framework and Robert Gagné’s instructional principles.',
  ],
  aims: [
    'Introduce learners to common phraseological units in English.',
    'Develop the ability to interpret figurative meanings through context.',
    'Enhance learners’ lexical and communicative competence.',
    'Foster intercultural awareness by exploring the cultural background of idioms.',
  ],
  features: [
    ['Stability', 'the word order and choice of words are usually fixed (cannot be easily changed).'],
    ['Semantic unity', 'the whole phrase has one meaning that is not equal to the sum of the parts.'],
    ['Syntactic function', 'they often act as a single part of a sentence.'],
    ['Stylistic and pragmatic value', 'many idioms are tied to cultural context, formality level, or emotional tone.'],
    ['Degree of fixity', 'some are completely fixed (“kick the bucket”), others semi-fixed (collocations like “make a decision”).'],
  ],
  whyText: 'They are used in real-life communication, so texts show them in authentic context. Texts highlight stylistic and communicative functions (formal, informal, humorous, etc.). Context helps learners guess meaning without translation. They develop both receptive (understanding) and productive (usage) skills step by step.',
  exerciseTypes: [
    'Identify and underline phraseological units in a text.',
    'Guess the meaning from context.',
    'Compare literal vs. idiomatic meaning.',
    'Matching task (idioms with definitions or equivalents).',
    'Gap-fill with phraseological units.',
    'Paraphrase literal sentences into idiomatic ones (and vice versa).',
    'Role-play / dialogue writing using given idioms.',
    'Creative writing — a short story including certain idioms.',
    'Error correction — find misused idioms in a text.',
    'Corpus exploration (advanced learners) — analyze authentic usage.',
  ],
  tips: [
    'Limit each lesson to 3–6 idioms for better retention.',
    'Follow a Pre-reading → While-reading → Post-reading structure.',
    'Use visuals and dialogues to reinforce idioms.',
    'Provide cross-linguistic notes (compare with equivalents in Uzbek).',
    'Apply recycling techniques (bring back idioms in later texts).',
    'Include short notes on origin, register, or stylistic use for each idiom.',
  ],
};

// Bosh sahifadagi "to'siq" — so'zma-so'z ma'no va asl ma'no
export const HERO_IDIOMS = [
  { en: 'Bite the bullet', literal: 'o‘qni tishlamoq', uz: 'qiyin yoki yoqimsiz ishga jur’at bilan kirishmoq', meaning: 'to do something difficult that you’ve been avoiding', lesson: 1 },
  { en: 'Spill the beans', literal: 'loviyani to‘kib yubormoq', uz: 'sirni oshkor qilib qo‘ymoq', meaning: 'to reveal a secret', lesson: 15 },
  { en: 'On cloud nine', literal: 'to‘qqizinchi bulut ustida', uz: 'o‘ta baxtiyor, boshi ko‘kka yetgan', meaning: 'feeling extremely happy', lesson: 9 },
  { en: 'Burn the candle at both ends', literal: 'shamni ikki uchidan yoqmoq', uz: 'dam olmay, o‘zini holdan toydirib ishlamoq', meaning: 'to overwork yourself, staying up late and getting up early', lesson: 6 },
  { en: 'Break the ice', literal: 'muzni sindirmoq', uz: 'tanglikni yumshatib, suhbatni boshlab yubormoq', meaning: 'to make people feel comfortable at the start', lesson: 2 },
  { en: 'Out of the blue', literal: 'moviylik ichidan', uz: 'kutilmaganda, to‘satdan', meaning: 'unexpectedly, without warning', lesson: 2 },
  { en: 'Bury the hatchet', literal: 'boltani ko‘mmoq', uz: 'yarashmoq, adovatga nuqta qo‘ymoq', meaning: 'to make peace and end a conflict', lesson: 1 },
  { en: 'A piece of cake', literal: 'bir bo‘lak tort', uz: 'juda oson ish', meaning: 'something very easy to do', lesson: 2 },
];

// Har bir darsning bosqichlari (kitobdagi tuzilma)
export const LESSON_FLOW = [
  { key: 'warmup',   uz: 'Warm-up',      en: 'Warm-up',     note: { uz: 'Rasm va savollar orqali mavzuga kirish', en: 'Pictures and questions to open the topic' } },
  { key: 'story',    uz: 'Hikoya',       en: 'Story',       note: { uz: 'Iboralar tabiiy kontekstda', en: 'Expressions in natural context' } },
  { key: 'glossary', uz: 'Lug‘at',       en: 'Glossary',    note: { uz: 'Har bir iboraning ma’nosi', en: 'The meaning of every expression' } },
  { key: 'practice', uz: 'Mashqlar',     en: 'Activities',  note: { uz: 'To‘ldirish, moslashtirish, test', en: 'Gap-fill, matching, quizzes' } },
  { key: 'video',    uz: 'Video',        en: 'Video',       note: { uz: 'Mavzuga oid video topshiriq', en: 'A video task on the theme' } },
  { key: 'wrapup',   uz: 'Wrap-up',      en: 'Wrap-up',     note: { uz: 'Muhokama va xulosa', en: 'Reflection and discussion' } },
  { key: 'homework', uz: 'Uy vazifasi',  en: 'Homework',    note: { uz: 'Iboralarni o‘z nutqingizda qo‘llash', en: 'Using the expressions yourself' } },
];
