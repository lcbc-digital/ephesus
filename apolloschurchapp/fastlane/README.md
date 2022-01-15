fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

## iOS

### ios certs

```sh
[bundle exec] fastlane ios certs
```

Generate new provisioning profiles and certificates for app and push notifications

### ios deploy

```sh
[bundle exec] fastlane ios deploy
```

Push a new internal build to TestFlight

### ios beta

```sh
[bundle exec] fastlane ios beta
```

Promote the most recent TestFlight build to external beta

### ios production

```sh
[bundle exec] fastlane ios production
```

Promote the most recent Testflight version to production

----


## Android

### android deploy

```sh
[bundle exec] fastlane android deploy
```

Deploy a new version to the Google Play

### android beta

```sh
[bundle exec] fastlane android beta
```

Promote current build to beta

### android production

```sh
[bundle exec] fastlane android production
```

Promote current build to production

----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
