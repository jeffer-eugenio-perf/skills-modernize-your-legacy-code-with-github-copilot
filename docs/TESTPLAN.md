# Test Plan for Current COBOL Student Account Application

This test plan documents the business logic and implementation behavior of the current COBOL student account app so it can be reviewed with business stakeholders and later translated into automated unit and integration tests in a Node.js application.

## Scope

This plan validates the current application behavior for:
- Initial account state
- Balance inquiry
- Credit transactions
- Debit transactions
- Insufficient funds validation
- Menu-driven workflow
- Invalid menu option handling
- Persistence of balance within the current runtime session

## Assumptions

- The application starts with a default balance of 1000.00.
- The balance is stored in memory for the duration of the session.
- The application has no external database or file persistence.
- Business requirements are inferred from the current implementation logic.

## Test Case Matrix

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---|---|
| TC-01 | Application starts and displays the main menu | COBOL app is launched successfully | 1. Run the program. 2. Observe initial screen. | Menu is displayed with options: 1. View Balance, 2. Credit Account, 3. Debit Account, 4. Exit. |  |  |  |
| TC-02 | User selects View Balance option | Program is running and menu is visible | 1. Enter `1`. 2. Observe program output. | Current balance is displayed. Initial value should be 1000.00. |  |  |  |
| TC-03 | User selects Credit Account option | Program is running and menu is visible | 1. Enter `2`. 2. Enter `250.00` when prompted. 3. Observe output. | Balance increases from 1000.00 to 1250.00 and updated balance is displayed. |  |  |  |
| TC-04 | User selects Debit Account with sufficient funds | Program is running and menu is visible with starting balance at 1000.00 | 1. Enter `3`. 2. Enter `300.00`. 3. Observe output. | Balance decreases from 1000.00 to 700.00 and updated balance is displayed. |  |  |  |
| TC-05 | User attempts debit greater than current balance | Program is running and menu is visible with current balance of 1000.00 | 1. Enter `3`. 2. Enter `1500.00`. 3. Observe output. | Program displays `Insufficient funds for this debit.` and balance remains unchanged. |  |  |  |
| TC-06 | User attempts debit equal to current balance | Program is running and current balance is 1000.00 | 1. Enter `3`. 2. Enter `1000.00`. 3. Observe output. | Balance becomes 0.00 and transaction is accepted. |  |  |  |
| TC-07 | User credits zero amount | Program is running and menu is visible | 1. Enter `2`. 2. Enter `0.00`. 3. Observe output. | Balance remains unchanged at the current value. |  |  |  |
| TC-08 | User debits zero amount | Program is running and menu is visible | 1. Enter `3`. 2. Enter `0.00`. 3. Observe output. | Balance remains unchanged and debit is treated as a no-op or valid zero-value subtraction. |  |  |  |
| TC-09 | User selects invalid menu option | Program is running and menu is visible | 1. Enter `9`. 2. Observe output. | Program displays `Invalid choice, please select 1-4.` and returns to the menu. |  |  |  |
| TC-10 | User selects Exit option | Program is running and menu is visible | 1. Enter `4`. 2. Observe output. | Program exits the loop and displays `Exiting the program. Goodbye!` |  |  |  |
| TC-11 | User performs credit followed by balance inquiry | Program is started with initial balance 1000.00 | 1. Enter `2`. 2. Enter `200.00`. 3. Enter `1`. 4. Observe output. | Balance displayed reflects the updated total of 1200.00. |  |  |  |
| TC-12 | User performs debit followed by balance inquiry | Program is started with initial balance 1000.00 | 1. Enter `3`. 2. Enter `250.00`. 3. Enter `1`. 4. Observe output. | Balance displayed reflects the updated total of 750.00. |  |  |  |
| TC-13 | User repeats multiple valid transactions in same session | Program is running and balance starts at 1000.00 | 1. Enter `2` and credit `50.00`. 2. Enter `3` and debit `25.00`. 3. Enter `1`. 4. Observe output. | Balance is updated cumulatively and final displayed balance is 1025.00. |  |  |  |
| TC-14 | User enters non-numeric value for amount input | Program is running and user is prompted for an amount | 1. Enter `2`. 2. Enter a non-numeric value such as `abc`. 3. Observe behavior. | Program behavior is not explicitly defined. This should be captured as a gap for future validation or validation rules. |  |  |  |
| TC-15 | User enters decimal amount with two decimal places | Program is running and user is prompted for an amount | 1. Enter `2`. 2. Enter `125.50`. 3. Observe output. | Amount is accepted and balance increases by 125.50. |  |  |  |
| TC-16 | User enters decimal amount in debit with sufficient funds | Program is running and balance is at least the requested amount | 1. Enter `3`. 2. Enter `99.99`. 3. Observe output. | Balance decreases by 99.99 and new total is saved. |  |  |  |
| TC-17 | User enters decimal amount in debit above available balance | Program is running with a limited balance | 1. Enter `3`. 2. Enter `1000.01`. 3. Observe output. | Program rejects the transaction and maintains previous balance. |  |  |  |
| TC-18 | Balance remains consistent after failed debit attempt | Program is running and a failed debit occurs | 1. Enter `3`. 2. Enter `9999.99` when starting balance is 1000.00. 3. Enter `1`. 4. Observe output. | The displayed balance remains 1000.00 after failed debit attempt. |  |  |  |
| TC-19 | Program continues after valid transaction until exit | Program is running | 1. Enter `2` and credit `100.00`. 2. Enter `1`. 3. Enter `4`. 4. Observe output. | User can continue performing actions until choosing exit, then the app terminates correctly. |  |  |  |
| TC-20 | Data persistence is maintained within the program session | Program is running | 1. Run the app. 2. Credit or debit funds. 3. Check the balance again. 4. Continue within same session. | Updated balance persists in memory while the session remains active. |  |  |  |
| TC-21 | Data is not persisted beyond the running program | Program is closed after a transaction | 1. Start app and credit `100.00`. 2. Exit the program. 3. Restart the app. | Balance resets to 1000.00 when the program is restarted because the working-storage values are reinitialized. |  |  |  |
| TC-22 | Menu loop repeats correctly after valid operation | Program is running | 1. Enter `1` to view balance. 2. Enter `2` to credit. 3. Enter `3` to debit. 4. Observe menu after each operation. | Menu redisplays after each valid operation until the user exits. |  |  |  |
| TC-23 | Multiple credit operations accumulate correctly | Program is running and starting balance is 1000.00 | 1. Enter `2` and add `100.00`. 2. Enter `2` and add `50.00`. 3. Enter `1`. 4. Observe output. | Final displayed balance is 1150.00. |  |  |  |
| TC-24 | Multiple debit operations subtract correctly when funds remain | Program is running and starting balance is 1000.00 | 1. Enter `3` and debit `200.00`. 2. Enter `3` and debit `150.00`. 3. Enter `1`. 4. Observe output. | Final displayed balance is 650.00. |  |  |  |
| TC-25 | User attempts to debit after partial credits and debits | Program is running with evolving balance | 1. Credit `300.00`. 2. Debit `200.00`. 3. Debit `250.00`. 4. Observe output. | Balance reflects cumulative changes; if funds are insufficient, transaction is rejected. |  |  |  |
