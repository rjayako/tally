/// <reference types="cypress" />

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })

// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })

// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })

// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Add a custom command for file upload
Cypress.Commands.add('attachFile', { prevSubject: 'element' }, (subject, { fileContent, fileName, mimeType }) => {
  const testFile = new File([fileContent], fileName, { type: mimeType })
  const dataTransfer = new DataTransfer()
  dataTransfer.items.add(testFile)
  
  return cy.wrap(subject).trigger('change', { 
    force: true,
    bubbles: true,
    cancelable: true,
    target: { files: dataTransfer.files }
  })
})

// Declare the Cypress namespace to include custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to attach a file to a file input
       * @example cy.get('input[type=file]').attachFile({ fileContent, fileName, mimeType })
       */
      attachFile(options: { fileContent: any, fileName: string, mimeType: string }): Chainable<Element>
    }
  }
} 