const fs = require('fs/promises')

const acses = require('../index')

const expect = require('chai').expect

const initConfig = {
  testMode: true,
  region: process.env.AWS_REGION || 'eu-west-1',
  defaultSender: {
    address: process.env.TEST_SENDER_ADDRESS || 'test@admiralcloud.com',
    name: process.env.TEST_SENDER_NAME || 'AdmiralCloud | Support TEST'
  }
}

const emailParams = {
  to: [{
    name: process.env.TEST_RECIPIENT_NAME || 'Test User',
    address: process.env.TEST_RECIPIENT_ADDRESS || 'test@example.com'
  }],
  subject: 'Test from ac-ses',
  text: 'Text of the message'
}

describe('CHECKING ERRORS', function () {
  it('Send email without init', async() => {
    let params = { ...emailParams }
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
    acses.init(initConfig)
  })

  it('Send a text email', async() => {
    let params = { ...emailParams }
    let result = await acses.sendEmail(params)
    expect(result).to.have.property('$metadata')
    expect(result).to.have.property('MessageId')
  })

  it('Send a HTML email', async() => {
    let params = { ...emailParams }
    const data = await fs.readFile(process.cwd() + '/test/htmlTemplate.html')
    params.subject = 'HTML Test E-Mail'
    params.html = data.toString()
    const result = await acses.sendEmail(params)
    expect(result).to.have.property('$metadata')
    expect(result).to.have.property('MessageId')
  })
})
