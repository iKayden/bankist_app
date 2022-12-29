'use strict';
// Mockup Data
// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Kayden Kharchenko',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2022-12-23T14:11:59.604Z',
    '2022-12-25T17:01:17.194Z',
    '2022-12-26T10:51:36.790Z',
    '2022-12-27T10:51:36.790Z',
    '2022-12-28T10:17:24.185Z',
    '2022-12-28T09:15:04.904Z',
  ],
  currency: 'EUR',
  locale: 'en-GB',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// DOM Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const logoutTimer = document.querySelector('.logout-timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const containerMovementsTime = document.querySelector('.movements__date');
const containerClock = document.querySelector('.clock');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//////////////////////////////////////////////////////////////////////
//Functions

const moneyDisplayFormatter = (value, locale, currency) => {
  // currency display formatting
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency
  }).format(value);
};

const formatMovementDate = (date, locale) => {

  const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return "Today";
  if (daysPassed === 1) return "Yesterday";
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const displayMovements = function(acc, sort = false) {
  containerMovements.innerHTML = "";
  const moves = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;
  //html generating loop start
  moves.forEach((move, i) => {
    const moveType = move > 0 ? "deposit" : "withdrawal";
    // displaying dates functionality
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const formattedMov = moneyDisplayFormatter(move, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${moveType}">${i + 1}: ${moveType}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${formattedMov}</div>
    </div>
  `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
};

const createUsernames = (accs) =>
  accs.forEach(
    acc => acc.username =
      acc.owner
        .toLowerCase()
        .split(" ")
        .map(el => el[0])
        .join("")
  );
createUsernames(accounts);

const countBalance = (acc) => {
  acc.balance = acc.movements.reduce((acc, curr) => acc + curr, 0);
  labelBalance.textContent = `${moneyDisplayFormatter(acc.balance, acc.locale, acc.currency)}`;
};

const calcDisplaySum = (acc) => {

  const incomes = acc.movements
    .filter(move => move > 0)
    .reduce((acc, move) => acc + move, 0);
  labelSumIn.textContent = `${moneyDisplayFormatter(incomes, acc.locale, acc.currency)}`;

  const outcomes = acc.movements
    .filter(move => move < 0)
    .reduce((acc, move) => acc + move, 0);
  labelSumOut.textContent = `${moneyDisplayFormatter(Math.abs(outcomes), acc.locale, acc.currency)}`;

  const interest = acc.movements
    .filter(move => move > 0)
    .map(deposit => deposit * acc.interestRate / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${moneyDisplayFormatter(interest, acc.locale, acc.currency)}`;
};

const updateUi = (acc) => {
  // Display movements
  displayMovements(acc);
  //Display balance
  countBalance(acc);
  // Display summary
  calcDisplaySum(acc);
};

// to display time in a better way (as 01:08)
const doubleDigitTime = (time) => `${time}`.padStart(2, 0);

// Login event handler
let currentAccount, timer;

btnLogin.addEventListener("click", (e) => {
  e.preventDefault();
  // Login Validation
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
  if (currentAccount?.pin === +inputLoginPin.value) {
    // Clean up inputs after login and lose focus from input
    inputLoginUsername.value = "";
    inputLoginPin.value = "";
    inputLoginPin.blur();

    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`;
    containerApp.style.opacity = 100;

    // Create a display of today's date -> d/m/y
    // API for dates
    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long"
    };

    labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);
    // timer logic (reset timer if exists)
    if (timer) clearInterval(timer);
    timer = startLogoutTimer();
    //refresh interface
    updateUi(currentAccount);
  }
});

// Money Transfer handler
btnTransfer.addEventListener("click", function(e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);
  // Pre Transfer validation
  if (amount > 0 &&
    receiver &&
    currentAccount.balance >= amount &&
    receiver?.username !== currentAccount.username
  ) {
    // Proceeding with the transfer
    currentAccount.movements.push(-amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiver.movements.push(amount);
    receiver.movementsDates.push(new Date().toISOString());

    updateUi(currentAccount);
    //reset the timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
  //clean up inputs and unfocus from last input
  inputTransferTo.value = "";
  inputTransferAmount.value = "";
  inputTransferAmount.blur();
});

// Close account handler (delete account)
btnClose.addEventListener("click", function(e) {
  e.preventDefault();
  if (currentAccount.username === inputCloseUsername.value && currentAccount.pin === +inputClosePin.value) {
    console.log(`deleted account: ${currentAccount.owner} `);
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);
    accounts.splice(index, 1);

    //clean up inputs and unfocus from last input
    inputCloseUsername.value = "";
    inputClosePin.value = "";
    inputClosePin.blur();

    // Logout functionality
    containerApp.style.opacity = 0;
    labelWelcome.textContent = "Log in to get started";
  }
});;


// Request a loan event handler
btnLoan.addEventListener("click", (e) => {
  e.preventDefault();
  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(move => move >= amount * 0.1)) {
    setTimeout(function() {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      updateUi(currentAccount);

    }, 3000);
    console.log(`Waiting for a (${moneyDisplayFormatter(amount, currentAccount.locale, currentAccount.currency)}) loan approval.....`);
  }
  inputLoanAmount.value = "";
  inputLoanAmount.blur();

  //reset the timer
  clearInterval(timer);
  timer = startLogoutTimer();
});

// Sorting movements handler
let setSort = false;
btnSort.addEventListener("click", (e) => {
  e.preventDefault();
  // toggle-like boolean functionality
  displayMovements(currentAccount, !setSort);
  setSort = !setSort;
});

// setInterval clock
const clock = (interval) => {
  setInterval(() => {

    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    };
    containerClock.textContent = new Intl.DateTimeFormat(currentAccount.locale, options).format(now);
    containerClock.style.borderBottom = "2px solid #666";
  }, interval);
};
clock(1000);

// Logout timer (5m)

const startLogoutTimer = () => {
  logoutTimer.style.opacity = 100;
  let time = 300;
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time === 0) {
      clearInterval(timer);
      // Logout functionality
      containerApp.style.opacity = 0;
      logoutTimer.style.opacity = 0;
      labelWelcome.textContent = "Log in to get started";
      alert("Due to inactivity you've been logged out");
    }
    time--;
  };
  // workaround to start the countdown of the timer immediately
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};
