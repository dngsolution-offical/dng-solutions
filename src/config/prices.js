// src/config/prices.js
// აქ ჩაწერე ყველა მენიუს და პროგრამის ფასი, რომ AI-მ იცოდეს გამოთვლა
export const PRICES = {
  menus: {
    standard: { name: 'სტანდარტული მენიუ', pricePerPerson: 50 },
    premium: { name: 'პრემიუმ მენიუ', pricePerPerson: 80 },
    vip: { name: 'VIP მენიუ', pricePerPerson: 120 },
  },
  programs: {
    entertainment: { name: 'გასართობი პროგრამა', pricePerHour: 150 },
    music: { name: 'მუსიკალური პროგრამა', pricePerHour: 100 },
    kids: { name: 'საბავშვო პროგრამა', pricePerHour: 80 },
  },
  taxes: 0.18, // 18% დღგ
};
