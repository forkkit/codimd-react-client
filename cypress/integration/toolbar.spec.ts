const testText = 'textText'
const testLink = 'http://codimd.org'

describe('Toolbar', () => {
  beforeEach(() => {
    cy.visit('/n/test')
    cy.get('.btn.active.btn-outline-secondary > i.fa-columns')
      .should('exist')
    cy.get('.CodeMirror textarea')
      .type('{ctrl}a', { force: true })
      .type('{backspace}')
    cy.viewport(1920, 1080)
  })

  it('bold', () => {
    cy.get('.CodeMirror textarea')
      .type(`${testText}`)
      .type('{ctrl}a')
    cy.get('.fa-bold')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `**${testText}**`)
  })

  it('italic', () => {
    cy.get('.CodeMirror textarea')
      .type(`${testText}`)
      .type('{ctrl}a')
    cy.get('.fa-italic')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `*${testText}*`)
  })

  it('underline', () => {
    cy.get('.CodeMirror textarea')
      .type(`${testText}`)
      .type('{ctrl}a')
    cy.get('.fa-underline')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `++${testText}++`)
  })

  it('strikethrough', () => {
    cy.get('.CodeMirror textarea')
      .type(`${testText}`)
      .type('{ctrl}a')
    cy.get('.fa-strikethrough')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `~~${testText}~~`)
  })

  it('subscript', () => {
    cy.get('.CodeMirror textarea')
      .type(`${testText}`)
      .type('{ctrl}a')
    cy.get('.fa-subscript')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `~${testText}~`)
  })

  it('superscript', () => {
    cy.get('.CodeMirror textarea')
      .type(`${testText}`)
      .type('{ctrl}a')
    cy.get('.fa-superscript')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `^${testText}^`)
  })

  it('heading', () => {
    cy.get('.CodeMirror textarea')
      .type(`${testText}`)
    cy.get('.fa-header')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `# ${testText}`)
    cy.get('.fa-header')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `## ${testText}`)
  })

  describe('code', () => {
    it('nothing selected empty line', () => {
      cy.get('.CodeMirror textarea')
        .type(`${testText}`)
        .type('{ctrl}a')
        .type('{backspace}')
      cy.get('.fa-code')
        .click()
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span')
        .should('have.text', '```')
      cy.get('.CodeMirror-code > div.CodeMirror-activeline > .CodeMirror-line > span  span')
        .should('have.text', '```')
    })

    it('nothing selected non line', () => {
      cy.get('.CodeMirror textarea')
        .type(`${testText}`)
        .type('{ctrl}a')
        .type('{leftArrow}')
      cy.get('.fa-code')
        .click()
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span')
        .should('have.text', '```')
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span')
        .should('have.text', testText)
      cy.get('.CodeMirror-code > div.CodeMirror-activeline > .CodeMirror-line > span  span')
        .should('have.text', '```')
    })

    it('line selected', () => {
      cy.get('.CodeMirror textarea')
        .type(`${testText}`)
        .type('{ctrl}a')
      cy.get('.fa-code')
        .click()
      cy.get('.CodeMirror-code > div:nth-of-type(1) > .CodeMirror-line > span > span')
        .should('have.text', '```')
      cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span')
        .should('have.text', testText)
      cy.get('.CodeMirror-code > div.CodeMirror-activeline > .CodeMirror-line > span  span')
        .should('have.text', '```')
    })
  })

  it('quote', () => {
    cy.get('.CodeMirror textarea')
      .type(`${testText}`)
    cy.get('.fa-quote-right')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `> ${testText}`)
    cy.get('.fa-quote-right')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `> > ${testText}`)
  })

  it('unordered list', () => {
    cy.get('.CodeMirror textarea')
      .type(`${testText}`)
    cy.get('.fa-list')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `- ${testText}`)
    cy.get('.fa-list')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `- - ${testText}`)
  })

  it('ordered list', () => {
    cy.get('.CodeMirror textarea')
      .type(`${testText}`)
    cy.get('.fa-list-ol')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `1. ${testText}`)
    cy.get('.fa-list-ol')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `1. 1. ${testText}`)
  })

  it('todo list', () => {
    cy.get('.CodeMirror textarea')
      .type(`${testText}`)
    cy.get('.fa-check-square')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `- [ ] ${testText}`)
    cy.get('.fa-check-square')
      .click()
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
      .should('have.text', `- [ ] - [ ] ${testText}`)
  })

  describe('link', () => {
    it('with selection text', () => {
      cy.get('.CodeMirror textarea')
        .type(`${testText}`)
        .type('{ctrl}a')
      cy.get('.fa-link')
        .click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
        .should('have.text', `[${testText}](https://)`)
    })

    it('without selection', () => {
      cy.get('.CodeMirror textarea')
        .type(`${testText}`)
      cy.get('.fa-link')
        .click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
        .should('have.text', `${testText}[](https://)`)
    })

    it('with selection link', () => {
      cy.get('.CodeMirror textarea')
        .type(`${testLink}`)
        .type('{ctrl}a')
      cy.get('.fa-link')
        .click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
        .should('have.text', `[](${testLink})`)
    })
  })

  describe('image', () => {
    it('with selection', () => {
      cy.get('.CodeMirror textarea')
        .type(`${testText}`)
        .type('{ctrl}a')
      cy.get('.fa-picture-o')
        .click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
        .should('have.text', `![${testText}](https://)`)
    })

    it('without selection', () => {
      cy.get('.CodeMirror textarea')
        .type(`${testText}`)
      cy.get('.fa-picture-o')
        .click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
        .should('have.text', `${testText}![](https://)`)
    })

    it('with selection link', () => {
      cy.get('.CodeMirror textarea')
        .type(`${testLink}`)
        .type('{ctrl}a')
      cy.get('.fa-picture-o')
        .click()
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span')
        .should('have.text', `![](${testLink})`)
    })
  })

  it('table', () => {
    cy.get('.fa-table')
      .click()
    cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span')
      .should('have.text', '| # 1  | # 2  | # 3  |')
    cy.get('.CodeMirror-code > div:nth-of-type(3) > .CodeMirror-line > span  span')
      .should('have.text', '| ---- | ---- | ---- |')
    cy.get('.CodeMirror-activeline > .CodeMirror-line > span ')
      .should('have.text', '| Text | Text | Text |')
  })

  it('line', () => {
    cy.get('.fa-minus')
      .click()
    cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span')
      .should('have.text', '----')
  })

  it('collapsable block', () => {
    cy.get('.fa-caret-square-o-down')
    .click()
    cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span')
    .should('have.text', '<details>')
  })

  it('comment', () => {
    cy.get('.fa-comment')
      .click()
    cy.get('.CodeMirror-code > div:nth-of-type(2) > .CodeMirror-line > span  span')
      .should('have.text', '> []')
  })

  describe('emoji', () => {
    it('picker is show when clicked', () => {
      cy.get('.emoji-mart')
        .should('not.exist')
      cy.get('.fa-smile-o')
        .click()
      cy.get('.emoji-mart')
        .should('exist')
    })

    it('picker is show when clicked', () => {
      cy.get('.fa-smile-o')
        .click()
      cy.get('.emoji-mart')
        .should('exist')
      cy.get('.emoji-mart-emoji-native')
        .first()
        .click()
      cy.get('.markdown-body')
        .should('have.text', '👍')
      cy.get('.CodeMirror-activeline > .CodeMirror-line > span ')
        .should('have.text', ':+1:')
    })
  })

})
