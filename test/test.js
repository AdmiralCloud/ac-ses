const fs = require('fs')

const acses = require('../index')

const expect = require('chai').expect 

var Redis = require('ioredis')
var redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
})

const testConfig = require('./testConfig.js')

describe('CHECKING ERRORS', function () {
  it('Send email without init', function(done) {
    let params = testConfig.email
    acses.sendEmail(params, (err) => {
      expect(err).eql({ message: 'pleaseUseInitBeforeSendingEmail' })
      return done()
    })
  })
})

describe('TESTING EMAIL', function () {
  it('Init AC SES', function(done) {
    acses.init(testConfig.init)
    return done()
  })

  it('Send a text email', function(done) {
    let params = testConfig.email
    acses.sendEmail(params, (err, result) => {
      if (err) return done(err)
      expect(result).to.have.property('ResponseMetadata')
      expect(result).to.have.property('MessageId')
      return done()
    })
  })

  it('Send a HTML email', function(done) {
    let params = testConfig.email
    fs.readFile(process.cwd() + '/test/htmlTemplate.html', (err, data) => {
      if (err) return done(err)
      params.subject = 'HTML Test E-Mail'
      params.html = data.toString()
      acses.sendEmail(params, (err, result) => {
        if (err) return done(err)
        expect(result).to.have.property('ResponseMetadata')
        expect(result).to.have.property('MessageId')
        return done()
      })
    })
  })

  it('Send a security email', function(done) {
    let params = testConfig.securityEmail
    acses.informSecurity(params, (err, result) => {
      if (err) return done(err)
      expect(result).to.have.property('ResponseMetadata')
      expect(result).to.have.property('MessageId')
      return done()
    })
  })

  it('Send a support email', function(done) {
    let params = testConfig.supportEmail
    acses.informSecurity(params, (err, result) => {
      if (err) return done(err)
      expect(result).to.have.property('ResponseMetadata')
      expect(result).to.have.property('MessageId')
      return done()
    })
  })
})

describe('TESTING BLOCK TIME', function() {
  this.timeout(60000)

  it('Init AC SES with Redis support', function(done) {
    testConfig.init.redis = redis
    acses.init(testConfig.init)
    return done()
  })

  it('Send a text email', function(done) {
    let params = testConfig.email
    params.html = null
    params.subject = 'Test email with blocktime'
    params.blockTime = 10
    acses.sendEmail(params, (err, result) => {
      if (err) return done(err)
      expect(result).to.have.property('ResponseMetadata')
      expect(result).to.have.property('MessageId')
      return done()
    })
  })

  it('Send a text email - should fail - it is the SAME email and block time is active', function(done) {
    let params = testConfig.email
    acses.sendEmail(params, (err, result) => {
      if (err) return done(err)
      expect(result).to.be.undefined
      return done()
    })
  })

  it('Wait until blocktime is over', function(done) {
    setTimeout(done, 10000)
  })

  it('Send a text email - should work again', function(done) {
    let params = testConfig.email
    params.html = null
    params.subject = 'Test after block time'
    acses.sendEmail(params, (err, result) => {
      if (err) return done(err)
      expect(result).to.have.property('ResponseMetadata')
      expect(result).to.have.property('MessageId')
      return done()
    })
  })

  it('Close Redis connection', function(done) {
    redis.quit(done)
  })
})
