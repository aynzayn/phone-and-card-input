const masks = {
  phone: '+7 (___) __-__-___',
  card: '____.____.____.____',
}
const DIGIT_REPLACER = '_';

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ACCEPTABLE_KEYS = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight'];
const SHORT_ERROR_TEXT = 'Не введен или введен не полностью';
const INVALID_ERROR_TEXT = 'Не валидный';

/**
 * Функция переставлющая курсор на досупное для ввода место
 */
const goToAccessablePosition = (inputDomElement) => {
  inputDomElement.selectionStart = inputDomElement.value.indexOf(DIGIT_REPLACER);
  inputDomElement.selectionEnd =  inputDomElement.selectionStart;
}

/**
 * Функция выдергивающая из исходной строки все цифры
 */
const getDigits = (target) => target.replace(/[^\d]/g, '');
/**
 * Функция выдергивающая из исходной строки все  цифры введенные пользователе
 *  т.е без цифр участвовавших в маске
 */
const getEnteredDigits = (target, mask) => getDigits(target).replace(getDigits(mask), '');

const repairValue = (target, mask, numbers) => {
  target.value = mask.split(DIGIT_REPLACER).reduce((previous, current, index, arr) => {
    return index < arr.length - 1 ? `${previous}${current}${numbers[index] || DIGIT_REPLACER}` : previous;
  }, '');
}

/**
 * Обработчик нажатия клавиши
 *  Если вводим цифру то разбирает строку и собирает заново согласно заданой маске
 *
 */
const onKeyDown = (event, mask) => {
  if (DIGITS.includes(event.key)) {
    event.preventDefault();
    event.target.parentElement.classList.remove('error');

    repairValue(event.target, mask, getEnteredDigits(event.target.value, mask) + event.key);
    goToAccessablePosition(event.target);
  } else if (!ACCEPTABLE_KEYS.includes(event.key)) {
    event.preventDefault();
  }
}

const onFocus = (event, mask) => {
  if (event.target.value === '') {
    event.target.value = mask;
  }
}

const onBlur = (event, mask) => {
  if (getEnteredDigits(event.target.value, mask) === '') {
    event.target.value = '';
  }
}

['phone', 'card'].forEach((value) => {
  // Не пользуемся id на тегах чтобы не было браузерного autocomplete
  const inputDomElement = document.getElementsByName(value)[0];
  inputDomElement.onfocus = (event) => onFocus(event, masks[value]);
  inputDomElement.onblur = (event) => onBlur(event, masks[value]);
  inputDomElement.onkeydown = (event) => onKeyDown(event, masks[value]);
});

/**
 * Проверка валидности номера карты по упрощенному Алгоритму Луна
 * https://ru.wikipedia.org/wiki/Алгоритм_Луна#Упрощённый_алгоритм
 */
const isValidCardNumber = (digits) => {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let cardNum = parseInt(digits[i]);
    if (i % 2 === 0) {
      cardNum *= 2;
      if (cardNum > 9) {
        cardNum = cardNum - 9;
      }
    }
    sum += cardNum;
  }
  return sum % 10 === 0;
}

const onSend = (event) => {
  const checkLenght = (event, mask) => {
    const inputDomElement = document.getElementsByName(mask)[0];
    if (inputDomElement.value.length < masks[mask].length) {
      inputDomElement.focus();
      inputDomElement.parentElement.classList.add('error');
      inputDomElement.parentElement.getElementsByClassName('error-text')[0].innerHTML = SHORT_ERROR_TEXT;
      event.preventDefault();
    };
  }

  checkLenght(event, 'card');
  checkLenght(event, 'phone');


  if (!isValidCardNumber(getEnteredDigits(document.getElementsByName('card')[0].value, masks.card))) {
    cardInputDomElement.focus();
    cardInputDomElement.parentElement.classList.add('error');
    cardInputDomElement.parentElement.getElementsByClassName('error-text')[0].innerHTML = INVALID_ERROR_TEXT;
    event.preventDefault();
  }
}

const onReset = (event) => {
  const cardInputDomElement = document.getElementsByName('card')[0];
  cardInputDomElement.parentElement.classList.remove('error');
  const phoneInputDomElement = document.getElementsByName('phone')[0];
  phoneInputDomElement.parentElement.classList.remove('error');
}

document.getElementsByName('send')[0].onclick  = onSend;
document.getElementsByName('reset')[0].onclick  = onReset;
