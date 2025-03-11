describe('Home Page', () => {
  beforeEach(() => {
    // Visit the home page before each test
    cy.visit('/')
  })

  it('should display the header', () => {
    // Check if the header is visible
    cy.get('header').should('be.visible')
    
    // Check if the logo is visible
    cy.get('header img').should('be.visible')
    
    // Check if the navigation links are visible
    cy.contains('Home').should('be.visible')
    cy.contains('Import').should('be.visible')
    cy.contains('About').should('be.visible')
  })

  it('should display the welcome section', () => {
    // Check if the welcome section is visible
    cy.contains('Quick Summary').should('be.visible')
    
    // When no files are uploaded, it should show the upload prompt
    cy.contains('Upload transactions to get started').should('be.visible')
  })

  it('should navigate to the import page', () => {
    // Click the Import link
    cy.contains('Import').click()
    
    // Check if the URL has changed to the import page
    cy.url().should('include', '/import')
    
    // Check if the import page title is visible
    cy.contains('Import Transactions').should('be.visible')
  })

  it('should display the footer', () => {
    // Check if the footer is visible
    cy.get('footer').should('be.visible')
  })
}) 