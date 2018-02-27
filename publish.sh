#!/bin/zsh

echo "do not forget to update version in package.json prior to running this script"

npx webpack
npm publish --access=public
scp src/main/javascript/public/net-monitor.min.js fenyo@fenyo.net:public_html/eowyn.eu.org/cloudflare/net-monitor-$(jq -r .version < package.json).min.js
ssh fenyo@fenyo.net "cd public_html/eowyn.eu.org/cloudflare/; rm -f net-monitor-latest.min.js ; ln -s "net-monitor-$(jq -r .version < package.json).min.js" net-monitor-latest.min.js"

