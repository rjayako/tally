# Cypress Test Suite

This directory contains the Cypress test suite for the application. The tests are written using Cypress, a JavaScript end-to-end testing framework.

## Structure

The test suite is organized into two main categories:

- `e2e/`: End-to-end tests that test the application as a whole
- `component/`: Component tests that test individual components in isolation
- `support/`: Support files for Cypress tests
- `fixtures/`: Test data files

## Running Tests

To run the tests, use the following commands:

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run all E2E tests headlessly
npm run test:e2e

# Run all component tests headlessly
npm run test:component
```

## Test Coverage

The Cypress test suite aims to cover the following aspects of the application:

1. **User Flows**: Testing complete user journeys through the application
2. **Component Behavior**: Testing individual components in isolation
3. **Error Handling**: Testing how the application handles errors
4. **Responsive Design**: Testing responsive behavior across different screen sizes

## E2E Tests

The E2E tests simulate real user interactions with the application. They test the application as a whole, including:

1. **Navigation**: Testing navigation between pages
2. **File Upload**: Testing the file upload functionality
3. **Data Display**: Testing that data is displayed correctly
4. **Error Handling**: Testing how the application handles errors

## Component Tests

The component tests test individual components in isolation. They test:

1. **Rendering**: Testing that components render correctly
2. **Interactions**: Testing user interactions with components
3. **Props**: Testing that components respond correctly to props
4. **Events**: Testing that components emit events correctly

## Adding New Tests

When adding new tests, follow these guidelines:

1. Create test files with the `.cy.ts` extension
2. Place E2E tests in the `e2e/` directory
3. Place component tests in the `component/` directory
4. Use descriptive test names that explain what's being tested
5. Test both happy paths and error cases 