# Tally - Financial Transaction Management

A modern web application for managing and analyzing financial transactions.

## Features

- Import transactions from CSV files
- Visualize spending trends
- Categorize transactions
- Generate insights from transaction data
- Responsive design for desktop and mobile

## Technology Stack

- **Frontend**: Vue 3, Nuxt 3, TypeScript, Tailwind CSS
- **State Management**: Pinia
- **Data Visualization**: Chart.js
- **Data Storage**: IndexedDB (via Dexie.js)
- **Testing**: Vitest, Vue Test Utils, Cypress

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tally.git
cd tally

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:3000.

## Testing

The application includes a comprehensive test suite using Vitest for unit and integration tests, and Cypress for E2E tests.

### Unit and Integration Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### End-to-End Tests

```bash
# Open Cypress Test Runner
npm run cypress:open

# Run all E2E tests headlessly
npm run test:e2e

# Run all component tests headlessly
npm run test:component
```

## Project Structure

- `components/`: Vue components
- `composables/`: Reusable composition functions
- `pages/`: Application pages
- `stores/`: Pinia stores
- `types/`: TypeScript type definitions
- `utils/`: Utility functions
- `test/`: Unit and integration tests
- `cypress/`: End-to-end tests

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
