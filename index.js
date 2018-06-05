const _ = require('lodash')
const async = require('async')
const aws = require('aws-sdk')

const crypto = require('crypto')

const acses = function() {
  let ses
  let redis // only required if blockTime should be used - use init to set a redis instance from your main app

  let defaultSender
  let supportRecipient
  let securityRecipient
  let operationsRecipient
  let defaultBlockTime = 60 // used for support and security

  const init = function(options) {
    ses = new aws.SES({
      accessKeyId: _.get(options, 'aws.accessKeyId', process.env.AWS_ACCESS_KEY),
      secretAccessKey: _.get(options, 'aws.secretAccessKey', process.env.AWS_ACCESS_SECRET),
      region: _.get(options, 'aws.region', process.env.AWS_REGION)
    })
    if (_.get(options, 'redis')) {
      redis = _.get(options, 'redis')
    }
    if (_.get(options, 'defaultBlockTime')) {
      defaultBlockTime = _.get(options, 'defaultBlockTime')
    }
    // helper
    if (_.get(options, 'defaultSender') && prepareEmailAddress(_.get(options, 'defaultSender'))) defaultSender = _.get(options, 'defaultSender')
    if (_.get(options, 'supportRecipient') && prepareEmailAddress(_.get(options, 'supportRecipient'))) supportRecipient = _.get(options, 'supportRecipient')
    if (_.get(options, 'securityRecipient') && prepareEmailAddress(_.get(options, 'securityRecipient'))) securityRecipient = _.get(options, 'securityRecipient')
    if (_.get(options, 'operationsRecipient') && prepareEmailAddress(_.get(options, 'operationsRecipient'))) operationsRecipient = _.get(options, 'operationsRecipient')
  }

  /**
   * Ingests an object with address and optional name and returns a string
   * Example
   * IN { address: john.doe@example.com, name: John Doe }
   * OUT John Doe <john.doe@example.com>
   * @param {*} params
   */
  const prepareEmailAddress = function(params) {
    if (!_.get(params, 'address')) throw new Error({ message: 'ACSES.prepareEmailAddress - address_required' })
    if (!_.isString(_.get(params, 'address'))) throw new Error({ message: 'ACSES.prepareEmailAddress - address_mustBeAString' })
    let email = (_.get(params, 'name') ? _.get(params, 'name') + ' <' : '') + _.get(params, 'address') + (_.get(params, 'name') ? '>' : '')
    return email
  }

  /**
   * Prepares and sends the email using AWS SDK
   * @param from OBJECT
   * @param from.address STRING from address
   * @param from.name STRING from name
   *
   * @param to ARRAY of recipients each with address, name
   * @param to.address STRING to email address
   * @param to.name STRING to name
   *
   * @param subject STRING
   * @param text STRING Text message
   *
   * @param blockTime INT OPTIONAL If set, you cannot send an email to the same recipient for the blockTime (helpful for warning messages - you don't want them every second!)
   * @param redisKey STRING OPTIONAL You can use your own redisKey for the blockTime feature, or let this app create an MD5 hash from the parameters
   *
   * @param {*} cb Optional callback
   */
  const sendEmail = function(params, cb) {
    if (!_.isObject(ses)) return cb({ message: 'pleaseUseInitBeforeSendingEmail' })
    if (!_.get(params, 'from') && defaultSender) _.set(params, 'from', defaultSender)
    const fieldCheck = [
      { field: 'from', type: _.isPlainObject, required: true },
      { field: 'to', type: _.isArray, required: true },
      { field: 'subject', type: _.isString, required: true },
      { field: 'text', type: _.isString },
      { field: 'html', type: _.isString },
      // OPTIONS
      { field: 'ReplyToAddresses', type: _.isArray }
    ]

    _.some(fieldCheck, (field) => {
      if (field.required && !_.has(params, field.field)) return cb({ message: field.field + '_required' })
      if (_.get(params, field.field) && !field.type(_.get(params, field.field))) return cb({ message: field.field + '_typeInvalid' })
    })

    // John Doe <john.doe@example.com>
    let toAdresses = _.map(params.to, (to) => {
      return prepareEmailAddress(to)
    })

    const sesParams = {
      Destination: {
        ToAddresses: toAdresses
      },
      Message: {
        Body: {},
        Subject: {
          Charset: 'UTF-8',
          Data: params.subject
        }
      },
      Source: prepareEmailAddress(params.from)
    }
    if (params.text) {
      _.set(sesParams, 'Message.Body.Text', { Charset: 'UTF-8', Data: params.text })
    }
    if (params.html) {
      _.set(sesParams, 'Message.Body.Html', { Charset: 'UTF-8', Data: params.html })
    }
    if (params.ReplyToAddresses) {
      _.set(sesParams, 'ReplyToAddresses', prepareEmailAddress(params.ReplyToAddresses))
    }

    async.series({
      checkBlockTime: function(done) {
        if (!redis || !params.blockTime) return done()
        let redisKey = _.get(params, 'redisKey', crypto.createHash('md5').update(JSON.stringify(sesParams)).digest('hex'))
        redis.set(redisKey, 1, 'EX', params.blockTime, 'NX', (err, result) => {
          if (err) return done(err)
          if (result === 'OK') return done()
          return done(423) // the key is already locked
        })
      },
      sendEmail: function(done) {
        ses.sendEmail(sesParams, done)
      }
    }, function allDone(err, result) {
      if (err && err === 423) err = null // this is not an error, just blocke
      if (_.isFunction(cb)) {
        return cb(err, _.get(result, 'sendEmail'))
      }
      if (err) throw new Error(err)
    })
  }

  /**
   * Use as as shortcut to inform support - no need for from or to, this is already pre-defined
   * Other than that, it works similar to sendEmail
   * Differences: no HTML to improve delivery
   * @param {*} params
   * @param {*} cb
   */
  const informSecurity = function(params, cb) {
    if (!securityRecipient) return cb({ message: 'acses.informSecurity - securityRecipient_notSet' })
    let message = {
      to: [securityRecipient],
      subject: params.subject,
      text: params.text,
      blockTime: _.get(params, 'blocktime', defaultBlockTime)
    }
    if (!_.isFunction(cb)) sendEmail(message, cb)
    else sendEmail(message)
  }

  /**
   * Use as as shortcut to inform support - no need for from or to, this is already pre-defined
   * Other than that, it works similar to sendEmail
   * Differences: no HTML to improve delivery
   * @param {*} params
   * @param {*} cb
   */
  const informSupport = function(params, cb) {
    if (!supportRecipient) return cb({ message: 'acses.informSecurity - supportRecipient_notSet' })
    let message = {
      to: [supportRecipient],
      subject: params.subject,
      text: params.text,
      blockTime: _.get(params, 'blocktime', defaultBlockTime)
    }
    if (!_.isFunction(cb)) sendEmail(message, cb)
    else sendEmail(message)
  }

  /**
   * Use as as shortcut to inform operations - no need for from or to, this is already pre-defined
   * Other than that, it works similar to sendEmail
   * Differences: no HTML to improve delivery
   * @param {*} params
   * @param {*} cb
   */
  const informOperations = function(params, cb) {
    if (!operationsRecipient) return cb({ message: 'acses.informSecurity - operationsRecipient_notSet' })
    let message = {
      to: [operationsRecipient],
      subject: params.subject,
      text: params.text,
      blockTime: _.get(params, 'blocktime', defaultBlockTime)
    }
    if (!_.isFunction(cb)) sendEmail(message, cb)
    else sendEmail(message)
  }

  return {
    init,
    sendEmail,
    informSecurity,
    informSupport,
    informOperations
  }
}

module.exports = acses()
