fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew install fastlane`

# Available Actions
## iOS
### ios certs
```
fastlane ios certs
```
Generate new provisioning profiles and certificates for app and push notifications
### ios deploy
```
fastlane ios deploy
```
Push a new internal build to TestFlight
### ios beta
```
fastlane ios beta
```
Promote the most recent TestFlight build to external beta
### ios production
```
fastlane ios production
```
Promote the most recent Testflight version to production

----

## Android
### android deploy
```
fastlane android deploy
```
Deploy a new version to the Google Play
### android beta
```
fastlane android beta
```
Promote current build to beta
### android production
```
fastlane android production
```
Promote current build to production

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
