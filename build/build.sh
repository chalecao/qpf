#!/bin/sh
node update.js
node r.js -o config.js
node r.js -o config.amd.js
lessc ../src/style/base.less ../dist/css/base.css
lessc ../src/style/naive.less ../dist/css/naive.css
lessc ../src/style/light.less ../dist/css/light.css
cp -r ../src/style/images ../dist/css/