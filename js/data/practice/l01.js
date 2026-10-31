// 1-dars: A Day in the Life — interaktiv mashqlar.
// Manba: kitob, 12–18-betlar. Javob kalitlari kitobdan olingan.
// Hikoya matni kitobdagi rasmdan ko'chirildi ("Jack fell like" → "felt like" tuzatildi).
// Yozma ishlar (o‘z gaplari, esse) va uy vazifasi egasining qarori bilan olib tashlangan (2026-11-01).
// [[...]] — lug'atdagi ibora; [[ko'rinish|lug'atdagi shakli]] — boshqa shaklda kelgan ibora.

export default {
  story: [
    'It was a bright and sunny morning, and Jack decided to [[hit the road|Hit the road]] early. He had a bone to pick with his boss about his ever-growing workload. But first, he thought, let me [[bite the bullet|Bite the bullet]] and grab some coffee.',
    'As he reached the coffee shop, he realized he’d forgotten his wallet. “Oh, great! [[When it rains, it pours|When it rains, it pours]],” he muttered. A kind stranger offered to pay for his coffee, and Jack was [[over the moon|Over the moon]]. “Thanks a million!” he said, vowing to pay it forward.',
    'Arriving at work, Jack noticed his boss was in a bad mood — probably because the project was up in the air. “Better to [[keep my head down|Keep your head down]],” Jack thought. But as the day dragged on, he couldn’t keep his cool.',
    '“Sir,” Jack began, “I’m really [[burning the candle at both ends|Burn the candle at both ends]]. Can we talk about balancing this workload?”',
    'His boss nodded. “I hear you, Jack. Let’s [[bury the hatchet|Bury the hatchet]] and divide the tasks more fairly.”',
    'By the end of the day, Jack felt like he’d [[won the jackpot|Win the jackpot]]. On his way home, he realized that life, despite its challenges, was all about [[rolling with the punches|Roll with the punches]] and taking things one step at a time.',
    'As he tucked into bed that night, he whispered, “[[All’s well that ends well|All’s well that ends well]].”',
  ],

  warmup: {
    id: 'warmup',
    kind: 'match',
    title: 'Guess the Meaning',
    instructions: {
      uz: 'Hikoyani o‘qishdan oldin: idiomalarning ma’nosini taxmin qiling va mos ma’noni tanlang.',
      en: 'Before reading: guess what each idiom means and choose the matching meaning.',
    },
    pairs: [
      ['hit the road', 'start a journey'],
      ['bite the bullet', 'do something difficult or unpleasant bravely'],
      ['over the moon', 'be extremely happy'],
      ['keep my head down', 'stay calm and avoid attention'],
      ['rolling with the punches', 'accept difficulties and continue'],
    ],
  },

  exercises: [
    {
      id: 'a1',
      kind: 'gap',
      title: 'Fill in the Blanks',
      instructions: {
        uz: 'Hikoyadagi mos idiomani tanlab, gaplarni to‘ldiring. Ikkita ibora ortiqcha.',
        en: 'Complete the sentences with the correct idiom from the story. Two idioms are extra.',
      },
      bank: ['bite the bullet', 'over the moon', 'when it rains, it pours', 'keep his head down', 'burning the candle at both ends', 'bury the hatchet', 'rolling with the punches', 'won the jackpot', 'hit the road', 'all’s well that ends well'],
      items: [
        ['Jack was feeling really stressed, so he decided to ___ and have a coffee before facing his boss.', 'bite the bullet'],
        ['He forgot his wallet at the coffee shop, and then a kind stranger paid for his coffee, so he was ___.', 'over the moon'],
        ['Things were not going well at work, and Jack was sure that ___ that day.', 'when it rains, it pours'],
        ['His boss was in a bad mood, and Jack decided it was best to ___ and not make things worse.', 'keep his head down'],
        ['Jack felt like he was ___ at work, trying to juggle too many tasks at once.', 'burning the candle at both ends'],
        ['After the meeting, Jack suggested they ___ and find a way to divide the work fairly.', 'bury the hatchet'],
        ['On his way home, Jack realized that life is all about ___ and not getting discouraged.', 'rolling with the punches'],
        ['By the end of the day, Jack felt like he had ___ because the day turned out to be much better than expected.', 'won the jackpot'],
      ],
    },
    {
      id: 'a2',
      kind: 'tf',
      title: 'True or False',
      instructions: {
        uz: 'Hikoyaga ko‘ra gaplar to‘g‘rimi (True) yoki noto‘g‘rimi (False)?',
        en: 'Read the statements and decide whether they are true or false based on the story.',
      },
      items: [
        ['Jack forgot his wallet, but no one helped him at the coffee shop.', false, 'A kind stranger offered to pay for his coffee.'],
        ['Jack decided to confront his boss immediately about the workload.', false, 'At first he decided to keep his head down.'],
        ['The stranger who helped Jack was rude and unhelpful.', false, 'The stranger was kind and paid for his coffee.'],
        ['Jack had a relaxing day at work with no stress.', false, 'He was burning the candle at both ends.'],
        ['By the end of the day, Jack realized life is about taking things one step at a time.', true, 'Life is all about rolling with the punches and taking things one step at a time.'],
      ],
    },
    {
      id: 'a3',
      kind: 'mcq',
      title: 'Multiple Choice',
      instructions: {
        uz: 'Hikoya asosida to‘g‘ri javobni tanlang.',
        en: 'Answer the following questions based on the story.',
      },
      items: [
        ['What idiom is used when Jack says things are getting worse after forgetting his wallet?', ['Burning the candle at both ends', 'When it rains, it pours', 'Bite the bullet', 'Hit the road'], 1],
        ['Which idiom reflects Jack’s excitement after someone helped him with coffee?', ['Keep my head down', 'Over the moon', 'Bury the hatchet', 'Rolling with the punches'], 1],
        ['Which idiom does Jack use when he talks to his boss about his workload?', ['Burning the candle at both ends', 'Won the jackpot', 'Hit the road', 'Bury the hatchet'], 0],
        ['What did Jack learn about life after his day at work?', ['It’s better to fight for what you want', 'It’s about rolling with the punches', 'Things can never improve', 'When it rains, it pours'], 1],
      ],
    },
    {
      id: 'a5',
      kind: 'hunt',
      title: 'Identify the Idiom',
      instructions: {
        uz: 'Har bir gapdagi idiomaning so‘zlarini bosib belgilang, keyin uning ma’nosini tanlang.',
        en: 'Tap the words of the idiom in each sentence, then choose its meaning.',
      },
      items: [
        ['Jack was feeling stressed about work, so he decided to hit the road early and clear his mind.', 'hit the road', 'to leave or start a journey'],
        ['When Jack forgot his wallet, a stranger came to his rescue, and Jack was over the moon.', 'over the moon', 'very pleased, extremely happy'],
        ['After a long day of working on the project, Jack felt like he was burning the candle at both ends.', 'burning the candle at both ends', 'to overwork yourself, staying up late and waking up early'],
        ['Jack’s boss was upset, and Jack realized it was best to keep his head down and avoid further conflict.', 'keep his head down', 'to avoid attracting attention or trouble'],
        ['By the end of the day, everything fell into place, and Jack thought to himself, All’s well that ends well.', 'All’s well that ends well', 'everything is fine in the end, even if there were problems'],
      ],
    },
  ],
};
