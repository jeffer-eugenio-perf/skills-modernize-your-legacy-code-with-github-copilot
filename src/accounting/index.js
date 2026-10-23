#!/usr/bin/env node

const readline = require('readline');

const ACCOUNT_INITIAL_BALANCE = 1000.0;

function createAccountStore(initialBalance = ACCOUNT_INITIAL_BALANCE) {
  let balance = initialBalance;

  return {
    read() {
      return balance;
    },
    write(value) {
      balance = Number(value);
      return balance;
    },
    reset() {
      balance = initialBalance;
      return balance;
    },
  };
}

const defaultStore = createAccountStore();

function formatCurrency(value) {
  return Number(value).toFixed(2);
}

function DataProgram(operation, incomingBalance, accountStore = defaultStore) {
  if (operation === 'READ') {
    return accountStore.read();
  }

  if (operation === 'WRITE') {
    return accountStore.write(incomingBalance);
  }

  return accountStore.read();
}

async function Operations(operation, promptFn, accountStore = defaultStore, logger = console) {
  const operationType = String(operation).padEnd(6, ' ');

  if (operationType === 'TOTAL ') {
    const finalBalance = DataProgram('READ', null, accountStore);
    logger.log(`Current balance: ${formatCurrency(finalBalance)}`);
    return finalBalance;
  }

  if (operationType === 'CREDIT') {
    const amountInput = await promptFn('Enter credit amount: ');
    const amount = Number(amountInput);

    if (!Number.isFinite(amount) || amount < 0) {
      logger.log('Invalid amount. Please enter a valid number.');
      return DataProgram('READ', null, accountStore);
    }

    const currentBalance = DataProgram('READ', null, accountStore);
    const updatedBalance = currentBalance + amount;
    DataProgram('WRITE', updatedBalance, accountStore);
    logger.log(`Amount credited. New balance: ${formatCurrency(updatedBalance)}`);
    return updatedBalance;
  }

  if (operationType === 'DEBIT ') {
    const amountInput = await promptFn('Enter debit amount: ');
    const amount = Number(amountInput);

    if (!Number.isFinite(amount) || amount < 0) {
      logger.log('Invalid amount. Please enter a valid number.');
      return DataProgram('READ', null, accountStore);
    }

    const currentBalance = DataProgram('READ', null, accountStore);

    if (currentBalance >= amount) {
      const updatedBalance = currentBalance - amount;
      DataProgram('WRITE', updatedBalance, accountStore);
      logger.log(`Amount debited. New balance: ${formatCurrency(updatedBalance)}`);
      return updatedBalance;
    }

    logger.log('Insufficient funds for this debit.');
    return currentBalance;
  }

  return DataProgram('READ', null, accountStore);
}

async function MainProgram({ promptFn, logger = console, accountStore = defaultStore } = {}) {
  const readPrompt = promptFn || ((question) => new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  }));

  let continueFlag = 'YES';

  while (continueFlag === 'YES') {
    logger.log('--------------------------------');
    logger.log('Account Management System');
    logger.log('1. View Balance');
    logger.log('2. Credit Account');
    logger.log('3. Debit Account');
    logger.log('4. Exit');
    logger.log('--------------------------------');

    const choice = await readPrompt('Enter your choice (1-4): ');

    switch (Number(choice)) {
      case 1:
        await Operations('TOTAL ', readPrompt, accountStore, logger);
        break;
      case 2:
        await Operations('CREDIT', readPrompt, accountStore, logger);
        break;
      case 3:
        await Operations('DEBIT ', readPrompt, accountStore, logger);
        break;
      case 4:
        continueFlag = 'NO';
        break;
      default:
        logger.log('Invalid choice, please select 1-4.');
        break;
    }
  }

  logger.log('Exiting the program. Goodbye!');
}

if (require.main === module) {
  MainProgram().catch((error) => {
    console.error('Unexpected application error:', error);
    process.exitCode = 1;
  });
}

module.exports = {
  ACCOUNT_INITIAL_BALANCE,
  DataProgram,
  Operations,
  MainProgram,
  createAccountStore,
};
