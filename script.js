'use strict';
// Mockup Data
// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
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

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const containerMovementsTime = document.querySelector('.movements__date');

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

function moneyDisplayFormatter(n, currency) {
  return currency + n.toFixed(2).replace(/./g, function(c, i, a) {
    return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
  });
}

const displayMovements = function(acc, sort = false) {
  containerMovements.innerHTML = "";
  const moves = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;
  moves.forEach((move, i) => {
    const moveType = move > 0 ? "deposit" : "withdrawal";

    const date = new Date(acc.movementsDates[i]);
    const day = doubleDigitTime(date.getDate());
    const month = doubleDigitTime(date.getMonth() + 1);
    const year = date.getFullYear();

    const displayDate = `${day}/${month}/${year}`;

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${moveType}">${i + 1}: ${moveType}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${moveType === "deposit" ? moneyDisplayFormatter(move, "€ ") : "€ " + move.toFixed(2)}</div>
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
  labelBalance.textContent = `${moneyDisplayFormatter(acc.balance, "€ ")}`;
};


const calcDisplaySum = (account) => {

  const incomes = account.movements
    .filter(move => move > 0)
    .reduce((acc, move) => acc + move, 0);
  labelSumIn.textContent = `${moneyDisplayFormatter(incomes, "€ ")}`;

  const outcomes = account.movements
    .filter(move => move < 0)
    .reduce((acc, move) => acc + move, 0);
  labelSumOut.textContent = `${moneyDisplayFormatter(Math.abs(outcomes), "€ ")}`;

  const interest = account.movements
    .filter(move => move > 0)
    .map(deposit => deposit * account.interestRate / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${moneyDisplayFormatter(interest, "€ ")}`;
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
let currentAccount;

// FAKE LOGGED IN
currentAccount = account1;
updateUi(currentAccount);
containerApp.style.opacity = 100;
/////////////////////////


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
    const now = new Date();
    const day = doubleDigitTime(now.getDate());
    const month = doubleDigitTime(now.getMonth() + 1);
    const year = now.getFullYear();
    const hour = doubleDigitTime(now.getHours());
    const minutes = doubleDigitTime(now.getMinutes());
    labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minutes}`;
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
    currentAccount.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    updateUi(currentAccount);

  }
  inputLoanAmount.value = "";
  inputLoanAmount.blur();
});

// Sorting movements handler
let setSort = false;
btnSort.addEventListener("click", (e) => {
  e.preventDefault();
  // toggle-like boolean functionality
  displayMovements(currentAccount, !setSort);
  setSort = !setSort;
});
