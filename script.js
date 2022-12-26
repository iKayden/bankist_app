'use strict';
// Mockup Data
const test = {
  owner: '1 1',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [test, account1, account2, account3, account4];

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

const displayMovements = function(movements, sort = false) {
  containerMovements.innerHTML = "";
  const moves = sort ? movements.slice().sort((a, b) => a - b) : movements;
  moves.forEach((move, i) => {
    const moveType = move > 0 ? "deposit" : "withdrawal";

    const html = `
    <div class="movements__row">
      <div class="movements__type movements__type--${moveType}">${i + 1}: ${moveType}</div>
      <div class="movements__value">${move}€</div>
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

function moneyDisplayFormatter(n, currency) {
  return currency + n.toFixed(2).replace(/./g, function(c, i, a) {
    return i > 0 && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
  });
}

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
  displayMovements(acc.movements);
  //Display balance
  countBalance(acc);
  // Display summary
  calcDisplaySum(acc);
};



// Login event handler
let currentAccount;
btnLogin.addEventListener("click", (e) => {
  e.preventDefault();
  // Login Validation
  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // Clean up inputs after login and lose focus from input
    inputLoginUsername.value = "";
    inputLoginPin.value = "";
    inputLoginPin.blur();

    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(" ")[0]}`;
    containerApp.style.opacity = 100;
    //refresh interface
    updateUi(currentAccount);



  }
});

// Money Transfer handler
btnTransfer.addEventListener("click", function(e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiver = accounts.find(acc => acc.username === inputTransferTo.value);
  // Pre Transfer validation
  if (amount > 0 &&
    receiver &&
    currentAccount.balance >= amount &&
    receiver?.username !== currentAccount.username
  ) {
    // Proceeding with the transfer
    currentAccount.movements.push(-amount);
    receiver.movements.push(amount);
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
  if (currentAccount.username === inputCloseUsername.value && currentAccount.pin === Number(inputClosePin.value)) {
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

btnLoan.addEventListener("click", (e) => {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(move => move >= amount * 0.1)) {
    currentAccount.movements.push(amount);
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
  displayMovements(currentAccount.movements, !setSort);
  setSort = !setSort;
});
