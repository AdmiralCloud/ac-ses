const _ = require('lodash')
const { v4: uuidV4 } = require('uuid')

const quotedPrintable = require('quoted-printable')
const utf8 = require('utf8')

const { SESClient, SendRawEmailCommand } = require("@aws-sdk/client-ses")

const acses = () => {
  let ses

  let defaultSender
  let testMode // if true, no email is sent
  let environment = process.env.NODE_ENV || 'development'
  let useEnvironmentPrefixInSubject = environment !== 'production'

  const init = function(options) {
    ses = new SESClient()
    if (_.get(options, 'testMode')) {
      testMode = _.get(options, 'testMode')
    }
    if (_.get(options, 'environment')) {
      environment = _.get(options, 'environment')
    }
    if (_.has(options, 'useEnvironmentPrefixInSubject')) useEnvironmentPrefixInSubject = _.get(options, 'useEnvironmentPrefixInSubject', false)

    // helper
    if (_.get(options, 'defaultSender') && prepareEmailAddress(_.get(options, 'defaultSender'))) defaultSender = _.get(options, 'defaultSender')
 
    return {
      testMode,
      environment,
      defaultSender
    }
  }

  /**
   * Ingests an object with address and optional name and returns a string
   * Example
   * IN { address: john.doe@example.com, name: John Doe }
   * OUT John Doe <john.doe@example.com>
   * @param {*} params
   */
  const prepareEmailAddress = ({ address, name }) => {
    if (!address) throw new Error({ message: 'ACSES.prepareEmailAddress - address_required' })
    if (!_.isString(address)) throw new Error({ message: 'ACSES.prepareEmailAddress - address_mustBeAString' })
    let email = name ? `${name} <${address}>` : address
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
   * @param attachments ARRAY Optional array of objects with properties: filename, content (as base64) and encoding as 'base64'
   *
   * @param encoding STRING OPTIONAL Encoding for multipart alternative parts - defaults to "quoted-printable"
   *
   */
  const sendEmail = async(params) => {
    if (!_.isObject(ses)) throw new Error('pleaseUseInitBeforeSendingEmail')
    if (!_.get(params, 'from') && defaultSender) _.set(params, 'from', defaultSender)
    const fieldCheck = [
      { field: 'from', type: _.isPlainObject, required: true },
      { field: 'to', type: _.isArray, required: true },
      { field: 'cc', type: _.isArray },
      { field: 'bcc', type: _.isArray },
      { field: 'subject', type: _.isString, required: true },
      { field: 'text', type: _.isString },
      { field: 'html', type: _.isString },
      // OPTIONS
      { field: 'replyTo', type: _.isArray },
      { field: 'attachments', type: _.isArray },
      { field: 'debug', type: _.isBoolean },
    ]

    _.some(fieldCheck, (field) => {
      if (field.required && !_.has(params, field.field)) throw new Error(field.field + '_required')
      if (_.get(params, field.field) && !field.type(_.get(params, field.field))) throw new Error(field.field + '_typeInvalid')
    })

    const boundaryMixed = uuidV4()
    const boundaryAlternative = uuidV4()
    const encoding = _.get(params, 'encoding', 'quoted-printable')

    // sendRawMessage
    let raw = 'From: ' + prepareEmailAddress(_.get(params, 'from')) + '\n'
    // prepare To, Cc, Bcc
    _.forEach(['to', 'cc', 'bcc'], type => {
      if (_.size(_.get(params, type))) {
        let recipients = _.map(_.get(params, type), (recipient) => {
          return prepareEmailAddress(recipient)
        })
        raw += _.upperFirst(type) + ': ' + _.join(recipients, ', ') + '\n'
      }
    })
    if (params.replyTo) {
      let recipients = _.map(_.get(params, 'replyTo'), (recipient) => {
        return prepareEmailAddress(recipient)
      })
      raw += 'Reply-To: ' + _.join(recipients, ', ') + '\n'
    }

    raw += 'Subject: ' + (useEnvironmentPrefixInSubject ? (_.toUpper(environment) + ' | ') : '') + params.subject + '\n'
    if (params?.debug) {
      console.log('ACSES | DEBUG Headers | %j', raw.split('/n'))
    }

    // announce multipart/mixed
    raw += 'Mime-Version: 1.0\n'
    raw += 'Content-type: multipart/mixed; boundary="' + boundaryMixed + '"\n\n'
    raw += 'This message is in MIME format. Since your mail reader does not understand this format, some or all of this message may not be legible.\n\n'

    // text and HTML are multipart/alternatives with their own boundaries
    raw += '--' + boundaryMixed + '\nContent-Type: multipart/alternative; boundary="' + boundaryAlternative + '"\n\n'
    if (params.text) {
      raw += '--' + boundaryAlternative + '\nContent-Type: text/plain; charset="UTF-8"\nContent-Transfer-Encoding: ' + encoding + '\n\n'
      raw += quotedPrintable.encode(utf8.encode(params.text)) + '\n\n'
    }
    if (params.html) {
      raw += '--' + boundaryAlternative + '\nContent-Type: text/html; charset="UTF-8"\nContent-Transfer-Encoding: ' + encoding + '\n\n'
      raw += quotedPrintable.encode(utf8.encode(params.html)) + '\n\n'
    }
    raw += '--' + boundaryAlternative + '--\n\n'

    if (params.attachments) {
      _.forEach(params.attachments, attachment => {
        raw += '--' + boundaryMixed + '\n'
        raw += 'Content-Disposition: attachment; filename="' + attachment.filename + '"\n'
        raw += 'Content-Type: ' + attachment.contentType + '; name="' + attachment.filename + '"\nContent-Transfer-Encoding: ' + attachment.encoding + '\n\n'
        raw += attachment.content + '\n\n'
      })
      raw += '--' + boundaryMixed + '--\n'
    }

    const rawParams = {
      RawMessage: { /* required */
        Data: Buffer.from(raw)
      }
    }
    
    if (testMode) {
      // return fake response, but do not send message
      let mockResponse = {
        '$metadata': {
          httpStatusCode: 200,
          requestId: uuidV4(),
          attempts: 1
        },
        MessageId: Math.random().toString(36) + '-' + uuidV4() + '-000000',
        testMode: true
      }
      return mockResponse
    }
    const command = new SendRawEmailCommand(rawParams)
    const response = await ses.send(command)
    return response
  }

  return {
    init,
    sendEmail
  }
}

module.exports = acses()
