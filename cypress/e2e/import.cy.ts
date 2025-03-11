describe('Import Page', () => {
  beforeEach(() => {
    // Visit the import page before each test
    cy.visit('/import')
  })

  it('should display the import form', () => {
    // Check if the page title is visible
    cy.contains('Import Transactions').should('be.visible')
    
    // Check if the file upload section is visible
    cy.get('input[type="file"]').should('exist')
    
    // Check if the card type selection is visible
    cy.contains('Select Card Type').should('be.visible')
    
    // Check if the account type selection is visible
    cy.contains('Select Account Type').should('be.visible')
  })

  it('should display the file gallery', () => {
    // Check if the file gallery is visible
    cy.contains('Files Uploaded').should('be.visible')
  })

  it('should validate file type', () => {
    // Create a test file with invalid extension
    cy.fixture('example.txt', 'base64').then(fileContent => {
      const testFile = Cypress.Blob.base64StringToBlob(fileContent, 'text/plain')
      const fileName = 'example.txt'
      
      // Upload the file
      cy.get('input[type="file"]').attachFile({
        fileContent: testFile,
        fileName,
        mimeType: 'text/plain',
      })
      
      // Check if the error message is displayed
      cy.contains('Please upload a CSV file').should('be.visible')
    })
  })

  it('should upload a valid CSV file', () => {
    // Create a test CSV file
    const csvContent = 'date,description,amount\n2023-01-01,Test Transaction,100.00'
    const testFile = Cypress.Blob.stringToArrayBuffer(csvContent)
    const fileName = 'test.csv'
    
    // Select card type and account type
    cy.get('input[value="default"]').check()
    cy.get('input[value="credit"]').check()
    
    // Upload the file
    cy.get('input[type="file"]').attachFile({
      fileContent: testFile,
      fileName,
      mimeType: 'text/csv',
    })
    
    // Check if the file was uploaded successfully
    cy.contains('File selected: test.csv').should('be.visible')
    
    // Check if the file appears in the gallery
    cy.contains('test.csv').should('be.visible')
  })
})