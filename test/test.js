const fs = require('fs/promises')

const acses = require('../index')

const expect = require('chai').expect 
const testConfig = require('./testConfig.js')

describe('CHECKING ERRORS', function () {
  it('Send email without init', async() => {
    let params = testConfig.email
    try {
      await acses.sendEmail(params)
    }
    catch(e) {
      expect(e.message).to.eql('pleaseUseInitBeforeSendingEmail')
    }
  })
})

describe('TESTING EMAIL', function () {
  it('Init AC SES', async() => {
    acses.init(testConfig.init)
  })

  it('Send a text email', async() => {
    let params = testConfig.email
    let result = await acses.sendEmail(params)
    expect(result).to.have.property('$metadata')
    expect(result).to.have.property('MessageId')
  })

  it('Send a HTML email', async() => {
    let params = testConfig.email
    const data = await fs.readFile(process.cwd() + '/test/htmlTemplate.html')
    params.subject = 'HTML Test E-Mail'
    params.html = data.toString()
    const result = await acses.sendEmail(params)
    expect(result).to.have.property('$metadata')
    expect(result).to.have.property('MessageId')
  })
})