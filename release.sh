#!/bin/sh
rm addon.zip
zip -r addon.zip . -x screenshots/\* test-webpages/ push.sh release.sh .git/\* .gitignore
