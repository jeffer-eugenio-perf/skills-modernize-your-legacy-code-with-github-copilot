const {
  ACCOUNT_INITIAL_BALANCE,
  createAccountStore,
  DataProgram,
  Operations,
  MainProgram,
} = require('./index');

describe('Legacy COBOL account rules mirrored in Node.js', () => {
  test('TC-02: view balance returns the initial balance', async () => {
    const accountStore = createAccountStore();
    const logger = { log: jest.fn() };

    await Operations('TOTAL ', async () => '', accountStore, logger);

    expect(DataProgram('READ', null, accountStore)).toBe(ACCOUNT_INITIAL_BALANCE);
    expect(logger.log).toHaveBeenCalledWith('Current balance: 1000.00');
  });

  test('TC-03: credit increases the balance', async () => {
    const accountStore = createAccountStore();
    const logger = { log: jest.fn() };

    await Operations('CREDIT', async () => '250.00', accountStore, logger);

    expect(DataProgram('READ', null, accountStore)).toBe(1250.0);
    expect(logger.log).toHaveBeenCalledWith('Amount credited. New balance: 1250.00');
  });

  test('TC-04: debit with sufficient funds reduces the balance', async () => {
    const accountStore = createAccountStore();
    const logger = { log: jest.fn() };

    await Operations('DEBIT ', async () => '300.00', accountStore, logger);

    expect(DataProgram('READ', null, accountStore)).toBe(700.0);
    expect(logger.log).toHaveBeenCalledWith('Amount debited. New balance: 700.00');
  });

  test('TC-05: debit above available balance is rejected', async () => {
    const accountStore = createAccountStore();
    const logger = { log: jest.fn() };

    await Operations('DEBIT ', async () => '1500.00', accountStore, logger);

    expect(DataProgram('READ', null, accountStore)).toBe(ACCOUNT_INITIAL_BALANCE);
    expect(logger.log).toHaveBeenCalledWith('Insufficient funds for this debit.');
  });

  test('TC-06: debit equal to current balance leaves the balance at zero', async () => {
    const accountStore = createAccountStore();
    const logger = { log: jest.fn() };

    await Operations('DEBIT ', async () => '1000.00', accountStore, logger);

    expect(DataProgram('READ', null, accountStore)).toBe(0.0);
    expect(logger.log).toHaveBeenCalledWith('Amount debited. New balance: 0.00');
  });

  test('TC-07: crediting zero leaves the balance unchanged', async () => {
    const accountStore = createAccountStore();
    const logger = { log: jest.fn() };

    await Operations('CREDIT', async () => '0.00', accountStore, logger);

    expect(DataProgram('READ', null, accountStore)).toBe(ACCOUNT_INITIAL_BALANCE);
    expect(logger.log).toHaveBeenCalledWith('Amount credited. New balance: 1000.00');
  });

  test('TC-08: debiting zero leaves the balance unchanged', async () => {
    const accountStore = createAccountStore();
    const logger = { log: jest.fn() };

    await Operations('DEBIT ', async () => '0.00', accountStore, logger);

    expect(DataProgram('READ', null, accountStore)).toBe(ACCOUNT_INITIAL_BALANCE);
    expect(logger.log).toHaveBeenCalledWith('Amount debited. New balance: 1000.00');
  });

  test('TC-09: invalid menu option displays the invalid choice message', async () => {
    const accountStore = createAccountStore();
    const logger = { log: jest.fn() };
    const input = ['9', '4'];

    await MainProgram({
      promptFn: async () => input.shift(),
      logger,
      accountStore,
    });

    expect(logger.log).toHaveBeenCalledWith('Invalid choice, please select 1-4.');
    expect(logger.log).toHaveBeenCalledWith('Exiting the program. Goodbye!');
  });

  test('TC-10: exit option ends the application loop', async () => {
    const accountStore = createAccountStore();
    const logger = { log: jest.fn() };
    const input = ['4'];

    await MainProgram({
      promptFn: async () => input.shift(),
      logger,
      accountStore,
    });

    expect(logger.log).toHaveBeenCalledWith('Exiting the program. Goodbye!');
  });

  test('TC-11: credit followed by balance check shows the updated total', async () => {
    const accountStore = createAccountStore();
    const logger = { log: jest.fn() };

    await Operations('CREDIT', async () => '200.00', accountStore, logger);
    await Operations('TOTAL ', async () => '', accountStore, logger);

    expect(DataProgram('READ', null, accountStore)).toBe(1200.0);
    expect(logger.log).toHaveBeenCalledWith('Current balance: 1200.00');
  });

  test('TC-13: multiple valid transactions accumulate correctly in one session', async () => {
    const accountStore = createAccountStore();
    const logger = { log: jest.fn() };

    await Operations('CREDIT', async () => '50.00', accountStore, logger);
    await Operations('DEBIT ', async () => '25.00', accountStore, logger);
    await Operations('TOTAL ', async () => '', accountStore, logger);

    expect(DataProgram('READ', null, accountStore)).toBe(1025.0);
    expect(logger.log).toHaveBeenCalledWith('Current balance: 1025.00');
  });

  test('TC-23: repeated credits accumulate correctly', async () => {
    const accountStore = createAccountStore();
    const logger = { log: jest.fn() };

    await Operations('CREDIT', async () => '100.00', accountStore, logger);
    await Operations('CREDIT', async () => '50.00', accountStore, logger);
    await Operations('TOTAL ', async () => '', accountStore, logger);

    expect(DataProgram('READ', null, accountStore)).toBe(1150.0);
    expect(logger.log).toHaveBeenCalledWith('Current balance: 1150.00');
  });

  test('TC-24: repeated debits subtract correctly while sufficient funds remain', async () => {
    const accountStore = createAccountStore();
    const logger = { log: jest.fn() };

    await Operations('DEBIT ', async () => '200.00', accountStore, logger);
    await Operations('DEBIT ', async () => '150.00', accountStore, logger);
    await Operations('TOTAL ', async () => '', accountStore, logger);

    expect(DataProgram('READ', null, accountStore)).toBe(650.0);
    expect(logger.log).toHaveBeenCalledWith('Current balance: 650.00');
  });

  test('TC-21: restarting the app resets the balance to the default value', () => {
    const accountStore = createAccountStore();
    accountStore.write(1500.0);

    const restartedStore = createAccountStore();

    expect(restartedStore.read()).toBe(ACCOUNT_INITIAL_BALANCE);
    expect(accountStore.read()).toBe(1500.0);
  });
});
