#!/bin/zsh

echo "BEFORE RUNNING THIS SCRIPT:"
echo "do not forget to run ssh -L 2222:localhost:22 fenyo.net"
echo "do not forget to update version in package.json prior to running this script"
echo "do not forget to commit and push the repo to GitHub (after having updated package.json)"
echo "do not forget docker login"
echo "do not forget npm adduser"

echo "sleeping 5 secs"
sleep 5
echo "starting to publish"

# net-monitor.bundle.dev.js  net-monitor.bundle.min.js  net-monitor.standalone.dev.js  net-monitor.standalone.min.js

npx webpack
npm publish --access=public
for b in bundle standalone
do
  for d in dev min
  do
    echo $b.$d
    scp -P 2222 src/main/javascript/public/net-monitor.$b.$d.js fenyo@localhost:public_html/eowyn.eu.org/cloudflare/net-monitor-$(jq -r .version < package.json).$b.$d.js
    ssh -p 2222 fenyo@localhost "cd public_html/eowyn.eu.org/cloudflare/; rm -f net-monitor-latest.$b.$d.js ; ln -s net-monitor-$(jq -r .version < package.json).$b.$d.js net-monitor-latest.$b.$d.js"
  done
done

rm -rf target
mvn clean compile war:war
scp -P 2222 target/net-monitor-*-SNAPSHOT.war fenyo@localhost:public_html/eowyn.eu.org/cloudflare/net-monitor-$(jq -r .version < package.json).war
ssh -p 2222 fenyo@localhost "cd public_html/eowyn.eu.org/cloudflare/; rm -f net-monitor-latest.war ; ln -s net-monitor-$(jq -r .version < package.json).war net-monitor-latest.war"

cd docker
make build-net-monitor
make push-net-monitor

