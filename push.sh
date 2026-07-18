# See https://extensionworkshop.com/documentation/develop/developing-extensions-for-firefox-for-android/
# Using a custom app icon can cause errors like 'Activity class {org.mozilla.firefox_beta/org.mozilla.firefox_beta.App} does not exist' so ensure to remove any custom icon if such an error happens
web-ext run -t firefox-android --adb-device <your ADB device, can find from `adb devices`> --firefox-apk <firefox package name, e.g. org.mozilla.fennec_fdroid or org.mozilla.firefox_beta>
