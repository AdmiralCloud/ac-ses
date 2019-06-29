<a name="1.1.4"></a>
## [1.1.4](https://github.com/mmpro/ac-ses/compare/v1.1.3...v1.1.4) (2019-06-29 13:12)


### Bug Fixes

* **AC SES:** Updated packages and moved to yarn | MP ([a54d213](https://github.com/mmpro/ac-ses/commit/a54d213))    
  Updated packages and moved to yarn



<a name="1.1.3"></a>
## [1.1.3](https://github.com/mmpro/ac-ses/compare/v1.1.2...v1.1.3) (2019-01-23 12:10)


### Bug Fixes

* **AC SES:** Encoding of multiparts is now a parameter | MP ([e335742](https://github.com/mmpro/ac-ses/commit/e335742))    
  Encoding of multiparts is now a parameter



<a name="1.1.2"></a>
## [1.1.2](https://github.com/mmpro/ac-ses/compare/v1.1.1...v1.1.2) (2019-01-23 10:16)


### Bug Fixes

* **AC SES:** Fixed an issue where iOS mail showed "no content" | MP ([d3f190f](https://github.com/mmpro/ac-ses/commit/d3f190f))    
  Multipart structure was not correct. Now it is fixed and iOS Mail displays the message properly.



<a name="1.1.1"></a>
## [1.1.1](https://github.com/mmpro/ac-ses/compare/v1.1.0...v1.1.1) (2018-12-31 11:14)


### Bug Fixes

* **AC SES:** Use SES sendRaw to support attachments | MP ([64632d8](https://github.com/mmpro/ac-ses/commit/64632d8))    
  Use SES sendRaw to support attachments



<a name="1.1.0"></a>
# [1.1.0](https://github.com/mmpro/ac-ses/compare/v1.0.4...v1.1.0) (2018-08-05 06:15)


### Features

* **AC SES:** Add testMode | MP ([13f8555](https://github.com/mmpro/ac-ses/commit/13f8555))    
  If testMode is activated, no email is sent, only a mock response is created and returned.



<a name="1.0.4"></a>
## [1.0.4](https://github.com/mmpro/ac-ses/compare/v1.0.3...v1.0.4) (2018-07-28 13:10)


### Bug Fixes

* **AC SES:** Fixed an issue with missing callbacks | MP ([f5cfcb7](https://github.com/mmpro/ac-ses/commit/f5cfcb7))    
  If callback is a function use it as callback!



<a name="1.0.3"></a>
## [1.0.3](https://github.com/mmpro/ac-ses/compare/v1.0.2...v1.0.3) (2018-06-05 08:09)


### Bug Fixes

* **AC SES:** Allow function call without callback | MP ([ef9289c](https://github.com/mmpro/ac-ses/commit/ef9289c))    
  Allow to call the functions without callback



<a name="1.0.2"></a>
## [1.0.2](https://github.com/mmpro/ac-ses/compare/v1.0.1...v1.0.2) (2018-06-05 07:32)


### Bug Fixes

* **AC SES:** Add operations recipient | MÜ ([803bcec](https://github.com/mmpro/ac-ses/commit/803bcec))    
  You can now use informOperations with a predefined operations email address to send and email to
this group.



<a name="1.0.1"></a>
## [1.0.1](https://github.com/mmpro/ac-ses/compare/v1.0.0...v1.0.1) (2018-06-02 10:11)


### Bug Fixes

* **AC SES:** Allow defaultBlockTime | MP ([2fbd64a](https://github.com/mmpro/ac-ses/commit/2fbd64a))    
  You can now set a default blockTime for support and security recipients.



<a name="1.0.0"></a>
# 1.0.0 (2018-06-02 09:36)


### Features

* **AC SES:** First commit | MP ([32465f7](https://github.com/mmpro/ac-ses/commit/32465f7))    
  First commit of this AC helper



