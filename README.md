# AC SES
A helper tool to send emails via AWS SES.  

## BREAKING CHANGES VERSION 2
+ use async/await
+ no more support for blocktime - use your application logic instead
+ no more support for group messages - use your application logid instead

## Usage
```
const acses = require('ac-ses')

// Min requirements
acses.init({ 
  defaultSender: {
    address: 'sender@domain.com
  }
})

let email = {
    to: [{ 
      name: 'Jane Doe', // optional
      address: 'jane.doe@admiralcloud.com'
    }],
    from: {
      address: 'john.doe@admiralcloud.com',
      name: 'John Doe' // optional
    },
    replyTo: [{ // optional
      name: 'Jane Doe',
      address: 'jane.doe@admiralcloud.com'
    }],
    subject: 'This is my subject',
    text: 'This is my message', // optional if you send html. It is good practice to always send a text
    html: 'This is my <b>message</b>' // optional
}

await acses.sendEmail(email)
// -> Response
{
  '$metadata': {
    httpStatusCode: 200,
    requestId: '123466-557d-4a75-8d5c-d71e336963ec',
    extendedRequestId: undefined,
    cfId: undefined,
    attempts: 1,
    totalRetryDelay: 0
  },
  MessageId: '12356-2c4f41dd-6f2b-402e-9c26-123355-000000'
}
```

Full setup
```
acses.init({ 
  defaultSender: {
    address: 'defaultSender@admiralcloud.com',
    name: 'AdmiralCloud Sender'
  },
  environment: ENVIRONMENT // defaults to proces.env.NODE_ENV,
  useEnvironmentPrefixInSubject: TRUE|FALSE // defaults to TRUE - prefixes e-mail subject with environment to avoid confusion during development
})
```

## Links
- [Website](https://www.admiralcloud.com/)

## License
[MIT License](https://opensource.org/licenses/MIT) Copyright © 2009-present, AdmiralCloud AG, Mark Poepping