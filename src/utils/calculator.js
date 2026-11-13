// src/utils/calculator.js
// ⚠️ ეს ფუნქცია ითვლის თანხებს. AI აქ არაფერს აკეთებს.

// ფასების ბაზა (მოგვიანებით შეიძლება Firebase-იდან წამოღება)
const PRICE_LIST = {
  menus: {
    'სტანდარტული': 25, // ფასი ერთ სტუმარზე
    'პრემიუმ': 45,
    'VIP': 70,
  },
  programs: {
    'სტანდარტული': 300,
    'გასართობი': 500,
    'VIP შოუ': 1200,
  },
  additional: {
    'ტორტი': 100,
    'ფოტოგრაფი': 250,
    'დეკორაცია': 150,
  }
};

export const calculateOrderFinances = (aiData) => {
  let menuTotal = 0;
  let programPrice = 0;
  let additionalTotal = 0;

  // 1. მენიუს გამოთვლა
  const guests = aiData.guests || 0;
  if (aiData.menuItems && aiData.menuItems.length > 0) {
    // თუ AI-მ მენიუს ტიპი ამოიღო
    const menuType = aiData.menuItems[0]?.name; 
    const pricePerGuest = PRICE_LIST.menus[menuType] || 0;
    menuTotal = pricePerGuest * guests;
  }

  // 2. პროგრამის ფასი
  const progType = aiData.programType;
  if (progType && PRICE_LIST.programs[progType]) {
    programPrice = PRICE_LIST.programs[progType];
  }

  // 3. დამატებითი სერვისები
  if (aiData.additionalServices && aiData.additionalServices.length > 0) {
    aiData.additionalServices.forEach(service => {
      if (PRICE_LIST.additional[service]) {
        additionalTotal += PRICE_LIST.additional[service];
      }
    });
  }

  // 4. ჯამები
  const subtotal = menuTotal + programPrice + additionalTotal;
  const taxRate = aiData.taxRate || 0;
  const taxAmount = (subtotal * taxRate) / 100;
  const totalAmount = subtotal + taxAmount;
  
  const paidAmount = aiData.paidAmount || 0;
  const balance = totalAmount - paidAmount;

  return {
    ...aiData,
    menuTotal,
    programPrice,
    additionalTotal,
    subtotal,
    taxAmount,
    totalAmount,
    paidAmount,
    balance,
    calculatedAt: new Date().toISOString()
  };
};