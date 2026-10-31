// Mashqlarni qisqa yozish uchun yordamchilar.
import { LESSONS } from '../lessons.js';

export const INSTR = {
  match: { uz: 'Har biriga mos ma’noni tanlang.', en: 'Choose the matching meaning for each item.' },
  gap: { uz: 'Ro‘yxatdan mos javobni tanlab, gaplarni to‘ldiring.', en: 'Complete the sentences with the correct answer from the list.' },
  tf: { uz: 'Hikoyaga ko‘ra gaplar to‘g‘rimi (True) yoki noto‘g‘rimi (False)?', en: 'Decide whether the statements are true or false based on the story.' },
  mcq: { uz: 'Hikoya asosida to‘g‘ri javobni tanlang.', en: 'Choose the correct answer based on the story.' },
  reorder: { uz: 'So‘zlarni to‘g‘ri tartibda bosib, gap tuzing. Xato bosilgan so‘zni yuqoridan bosib qaytaring.', en: 'Tap the words in the right order to build the sentence. Tap a word above to take it back.' },
  order: { uz: 'Voqealarni hikoyadagi tartibda raqamlang.', en: 'Number the events in the order they happen in the story.' },
  rewrite: { uz: 'Birinchi gapni o‘qing va ikkinchi gapni ma’nosi o‘zgarmaydigan ibora bilan to‘ldiring.', en: 'Read the first sentence and complete the second one with an expression that keeps the same meaning.' },
  video: { uz: 'Dars oxiridagi videoni ko‘ring va to‘g‘ri javobni tanlang.', en: 'Watch the video at the end of the lesson and choose the correct answer.' },
  riddle: { uz: 'Barnabi kabi topishmoqlarni yeching: javobni ro‘yxatdan tanlang.', en: 'Solve the riddles like Barnaby did: choose the answer from the list.' },
};

const gloss = (n, term) => {
  const l = LESSONS.find((x) => x.n === n);
  const g = l.glossary.find((x) => x[0].toLowerCase() === term.toLowerCase());
  if (!g) throw new Error(`Glossary term not found: ${n} ${term}`);
  return g[1];
};

// Warm-up: kitobdagi rasm (muhokama uchun) + 5 ta iboraning ma’nosini taxmin qilish
export const warmup = (n, terms, image = `img/warmup/${String(n).padStart(2, '0')}.webp`) => ({
  id: 'warmup',
  kind: 'match',
  title: 'Guess the Meaning',
  image,
  instructions: {
    uz: 'Hikoyani o‘qishdan oldin: rasmni ko‘rib, savollarni sherigingiz bilan muhokama qiling. So‘ng iboralarning ma’nosini taxmin qiling.',
    en: 'Before reading: look at the picture and discuss the questions with a partner. Then guess what the expressions mean.',
  },
  pairs: terms.map((t) => [t, gloss(n, t)]),
});

export const match = (id, title, pairs, instructions = INSTR.match) => ({ id, kind: 'match', title, instructions, pairs });
export const order = (id, title, events) => ({ id, kind: 'match', ordered: true, title, instructions: INSTR.order, pairs: events.map(([e, k]) => [e, String(k)]) });
export const gap = (id, title, items, { extra = [], instructions = INSTR.gap } = {}) => ({
  id, kind: 'gap', title, instructions, items, bank: [...new Set([...items.map((i) => i[1]), ...extra])],
});
// [asl gap, ___ bilan qayta yozilgan gap, javob]
export const rewrite = (id, title, items, extra = []) => gap(id, title, items.map(([orig, text, ans]) => [text, ans, orig]), { extra, instructions: INSTR.rewrite });
export const tf = (id, title, items) => ({ id, kind: 'tf', title, instructions: INSTR.tf, items });
export const mcq = (id, title, items, instructions = INSTR.mcq) => ({ id, kind: 'mcq', title, instructions, items });
export const reorder = (id, title, items) => ({ id, kind: 'reorder', title, instructions: INSTR.reorder, items });

// "1-F, 2-T" ko‘rinishidagi kalitni true/false ro‘yxatiga aylantiradi
export const tfKey = (statements, key) => {
  const marks = key.split(',').map((x) => x.trim().split('-')[1].trim().toUpperCase());
  if (marks.length !== statements.length) throw new Error(`TF key length mismatch: ${statements[0]}`);
  return statements.map((s, i) => [s, marks[i] === 'T']);
};
// "1-b, 2-d" → [1, 3]
export const abc = (key) => key.split(',').map((x) => 'abcd'.indexOf(x.trim().split('-')[1].trim().toLowerCase()));
