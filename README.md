# AC SES
A helper tool to send emails via AWS SES.  
It also support "convenience" calls, to inform groups (e.g. support with informSupport function)

## Usage

```
const acses = require('ac-ses')

// Min requirements
acses.init({ 
  aws: {
    accessKeyId: 'xxx',
    secretAccessKey: 'xxx',
    region: 'eu-west-1'  
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
    subject: 'This is my subject',
    text: 'This is my message', // optional if you send html. It is good practice to always send a text
    html: 'This is my <b>message</b>' // optional
}

acses.sendEmail(email, (err, result) => {
  console.log(err, result)
  // More infos regarding the result:
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/SES.html#sendEmail-property
})
```

Full setup

```
acses.init({ 
  aws: {
    accessKeyId: 'xxx',
    secretAccessKey: 'xxx',
    region: 'eu-west-1'  
  },
  defaultSender: {
    address: 'defaultSender@admiralcloud.com',
    name: 'AdmiralCloud Sender'
  },
  securityRecipient: {
    address: 'defaultSecurityRecipient@admiralcloud.com',
    name: 'AdmiralCloud Security'
  },
  supportRecipient: {
    address:    address: 'defaultSupportRecipient@admiralcloud.com',
    name: 'AdmiralCloud Support'
  }
})


```

## Links
- [Website](https://www.admiralcloud.com/)
- [Twitter (@admiralcloud)](https://twitter.com/admiralcloud)
- [Facebook](https://www.facebook.com/MediaAssetManagement/)

## License
[MIT License](https://opensource.org/licenses/MIT) Copyright © 2009-present, AdmiralCloud, Mark Poepping