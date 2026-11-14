// src/utils/authErrors.js — Firebase Auth შეცდომების თარგმანი (ka / en / ru)
const MAP = {
  ka: {
    'auth/email-already-in-use': 'ეს ელ-ფოსტა უკვე რეგისტრირებულია. სცადე შესვლა.',
    'auth/invalid-email': 'ელ-ფოსტის ფორმატი არასწორია.',
    'auth/weak-password': 'პაროლი სუსტია. გამოიყენე მინიმუმ 8 სიმბოლო.',
    'auth/missing-password': 'შეიყვანე პაროლი.',
    'auth/invalid-credential': 'ელ-ფოსტა ან პაროლი არასწორია.',
    'auth/wrong-password': 'პაროლი არასწორია.',
    'auth/user-not-found': 'ასეთი მომხმარებელი ვერ მოიძებნა.',
    'auth/too-many-requests': 'ძალიან ბევრი მცდელობა. სცადე რამდენიმე წუთში.',
    'auth/network-request-failed': 'ინტერნეტის კავშირი ვერ მოხერხდა.',
    'auth/popup-closed-by-user': 'Google-ის ფანჯარა დაიხურა.',
    'auth/operation-not-allowed': 'ეს შესვლის მეთოდი Firebase-ში ჩართული არ არის.',
    default: 'შეცდომა. სცადე თავიდან.',
  },
  en: {
    'auth/email-already-in-use': 'This email is already registered. Try signing in.',
    'auth/invalid-email': 'Invalid email format.',
    'auth/weak-password': 'Password is too weak. Use at least 8 characters.',
    'auth/missing-password': 'Please enter a password.',
    'auth/invalid-credential': 'Email or password is incorrect.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/too-many-requests': 'Too many attempts. Try again in a few minutes.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-closed-by-user': 'The Google window was closed.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled in Firebase.',
    default: 'Something went wrong. Please try again.',
  },
  ru: {
    'auth/email-already-in-use': 'Этот email уже зарегистрирован. Попробуйте войти.',
    'auth/invalid-email': 'Неверный формат email.',
    'auth/weak-password': 'Слабый пароль. Используйте минимум 8 символов.',
    'auth/missing-password': 'Введите пароль.',
    'auth/invalid-credential': 'Email или пароль неверны.',
    'auth/wrong-password': 'Неверный пароль.',
    'auth/user-not-found': 'Аккаунт с таким email не найден.',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте через несколько минут.',
    'auth/network-request-failed': 'Ошибка сети. Проверьте соединение.',
    'auth/popup-closed-by-user': 'Окно Google было закрыто.',
    'auth/operation-not-allowed': 'Этот способ входа не включен в Firebase.',
    default: 'Ошибка. Попробуйте еще раз.',
  },
};

export function authErrorMessage(err, lang = 'ka') {
  const dict = MAP[lang] || MAP.ka;
  return dict[err?.code] || dict.default;
}