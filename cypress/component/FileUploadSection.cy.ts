import FileUploadSection from '../../components/FileUploadSection.vue'

describe('FileUploadSection.cy.ts', () => {
  beforeEach(() => {
    // Mount the component
    cy.mount(FileUploadSection)
  })

  it('renders correctly', () => {
    // Check if the component renders
    cy.get('input[type="file"]').should('exist')
    
    // Check if the card type selection is visible
    cy.contains('Select Card Type').should('be.visible')
    
    // Check if the account type selection is visible
    cy.contains('Select Account Type').should('be.visible')
  })

  it('selects card type and account type', () => {
    // Select card type
    cy.get('input[type="radio"]').first().check()
    cy.get('input[type="radio"]').first().should('be.checked')
    
    // Select account type
    cy.contains('Debit Card').click()
    cy.get('input[value="debit"]').should('be.checked')
  })

  it('shows error for invalid file type', () => {
    // Create a test file with invalid extension
    const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' })
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(testFile)
    
    // Upload the file
    cy.get('input[type="file"]').then(input => {
      input[0].files = dataTransfer.files
      cy.wrap(input).trigger('change')
    })
    
    // Check if the error message is displayed
    cy.contains('Please upload a CSV file').should('be.visible')
  })

  it('handles valid CSV file', () => {
    // Create a test CSV file
    const testFile = new File(['test,content'], 'test.csv', { type: 'text/csv' })
    const dataTransfer = new DataTransfer()
    dataTransfer.items.add(testFile)
    
    // Upload the file
    cy.get('input[type="file"]').then(input => {
      input[0].files = dataTransfer.files
      cy.wrap(input).trigger('change')
    })
    
    // Check if the file name is displayed
    cy.contains('File selected: test.csv').should('be.visible')
  })
}) 