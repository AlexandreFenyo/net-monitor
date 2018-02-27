#!/bin/zsh

npx webpack
npm publish --access=public
scp src/main/javascript/public/net-monitor.min.js fenyo@fenyo.net:public_html/eowyn.eu.org/cloudflare/net-monitor-$(jq -r .version < package.json).min.js

