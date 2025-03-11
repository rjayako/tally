# Frontend Test Suite

This directory contains the test suite for the frontend of the application. The tests are written using Vitest and Vue Test Utils.

## Structure

The test suite is organized to mirror the structure of the application:

- `components/`: Tests for Vue components
- `composables/`: Tests for composables
- `pages/`: Tests for page components
- `setup.ts`: Test setup and mocks

## Running Tests

To run the tests, use the following commands:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Test Coverage

The test suite aims to cover the following aspects of the application:

1. **Component Rendering**: Ensuring components render correctly with the expected content
2. **Component Interactions**: Testing user interactions like clicks, form submissions, etc.
3. **Data Flow**: Verifying data is correctly passed between components
4. **Error Handling**: Testing how the application handles errors
5. **Responsive Design**: Testing responsive behavior where applicable

## Mocking Strategy

The tests use the following mocking strategy:

1. **API Calls**: All API calls are mocked to avoid external dependencies
2. **Composables**: Composables are mocked to isolate component behavior
3. **Browser APIs**: Browser APIs like IndexedDB are mocked using fake-indexeddb
4. **File API**: The File API is mocked to test file upload functionality

## Adding New Tests

When adding new tests, follow these guidelines:

1. Create test files with the `.test.ts` extension
2. Place tests in the appropriate directory based on what they're testing
3. Use descriptive test names that explain what's being tested
4. Mock external dependencies to isolate the code being tested
5. Test both happy paths and error cases

## Key Components Tested

1. **FileUploadSection**: Tests file selection, validation, and upload functionality
2. **FileGallery**: Tests file listing, viewing, and deletion
3. **WelcomeSection**: Tests the dashboard summary and statistics
4. **AppHeader**: Tests navigation and responsive behavior
5. **IndexPage**: Tests the main page layout and section rendering
6. **ImportPage**: Tests the import page functionality

## Data Layer Testing

The `useDexie` composable is tested to ensure:

1. CSV import works correctly
2. Transaction data is stored and retrieved properly
3. File deduplication works as expected
4. Error handling for invalid data works correctly 