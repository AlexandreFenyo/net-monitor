# Client installation

## Install from the npmjs repository

### package managers

You can install net-monitor from the [npmjs repository](https://www.npmjs.com/) using your favorite package manager: [npm](https://www.npmjs.com/docs/orgs/) or [yarn](https://yarnpkg.com/	) (avoid using [bower](https://bower.io/blog/2017/how-to-migrate-away-from-bower/) for new client side modules). This will install net-monitor and its dependencies.

You can also access the dedicated page on npmjs: https://www.npmjs.com/package/@fenyo/net-monitor

### npm

`npm install @fenyo/net-monitor --save`

### yarn

`yarn add @fenyo/net-monitor`

### Select the correct build

There are two different builds available:

- A standalone build:
`src/main/javascript/public/net-monitor.standalone.min.js`

- A build bundled with dependencies: 
`src/main/javascript/public/net-monitor.bundle.min.js`

## Install from the Cloudflare CDN

The Cloudflare base directory that contains each build is https://eowyn.eu.org/cloudflare/




## Build from sources

### Linux

#### First installation

Note: this example is for Linux Ubuntu 16.04 LTS.

- Download the sources

  Download from github: 

    `user% git clone https://github.com/AlexandreFenyo/net-monitor.git`
  
- JavaScript part (client module for use in browsers):

  - Install a **recent** version of nodejs:
    - Bind to a recent node repository:
      `root# curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`
      
    - Install node from this repository:
      `root# apt-get install nodejs`
      
      Note 1:
If you do not bind to a recent repository, the node version installed may be too much older to work correctly with yarn (see yarn installation below).

      Note 2:
A recent version of npm has been installed, as a dependency of this recent nodejs.

  - Install yarn:
    `root# npm install -g yarn`

  - Populate JavaScript module dependencies into `node_modules` repository:
    `user% yarn install`

  - Use webpack and Babel to transpile, add polyfill, minify and package the JavaScript module:
    `user% npx webpack`
    
    This will create `src/main/javascript/public/net-monitor/net-monitor.min.js` from `src/main/javascript/src/net-monitor.js` and relative dependencies in `node_modules`

- Java EE part (application server):

  - Install a recent JDK to build the JEE application:
    `root# apt-get install openjdk-8-jdk`

  - Install maven:
    `root# apt-get install maven`

  - Build with maven:
    `user% mvn clean install`

    The generated WAR file is built here: `net-monitor/target/net-monitor-0.0.1-SNAPSHOT.war`

  - Run this application with tomcat:
    `user% mvn tomcat7:run-war`

- Access to the generated resources

  - Now, you can access the demo application on:
http://localhost:8080/net-monitor
  From a remote host, use:
http://HOSTNAME:8080/net-monitor

  - The module is available here:
http://HOSTNAME:8080/net-monitor/javascript/public/net-monitor.min.js

#### Update files

If you update source files, just run the following command lines to take updates into account:
````bash
user% npx webpack
user% mvn compile install
user% mvn tomcat7:run-war
````

### Windows + Eclipse



## Support

Best-effort support is available here :

![support](docs/support.png)

----------

increase version in package.json
npm publish --access=public
https://www.npmjs.com/package/@fenyo/net-monitor
https://www.npmjs.com/package/webstomp-client
https://eowyn.eu.org/cloudflare/

----------

written with StackEdit - Support StackEdit

[![](https://cdn.monetizejs.com/resources/button-32.png)](https://monetizejs.com/authorize?client_id=ESTHdCYOi18iLhhO&summary=true)

[StackEdit](https://stackedit.io/) is a full-featured, open-source Markdown editor based on PageDown, the Markdown library used by Stack Overflow and the other Stack Exchange sites.

<!--stackedit_data:
eyJoaXN0b3J5IjpbLTU0NzAzMjQzN119
-->
<!--stackedit_data:
eyJoaXN0b3J5IjpbOTE0MDM4NDkwXX0=
-->