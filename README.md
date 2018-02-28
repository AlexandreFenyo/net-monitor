# Client installation

## Install from the JEE server

If you have installed the JEE server that comes with net-monitor, you already have installed the net-monitor client on it, and its dependencies.

Suppose that the server is running on host `host` and port `port`:

- the bundle build is available on:
  http(s)://host:port/net-monitor/javascript/public/net-monitor.bundle.min.js

- the standalone build is available on:
  http(s)://host:port/net-monitor/javascript/public/net-monitor.standalone.min.js

- the dependencies, for use with the standalone build, are available on:

  http(s)://host:port/net-monitor/jquery/dist/jquery.min.js
  
  http(s)://host:port/net-monitor/moment/moment.js
  
  http(s)://host:port/net-monitor/webstomp-client/dist/webstomp.min.js
  
  http(s)://host:port/net-monitor/chart.js/dist/Chart.bundle.min.js

  
## Install from the npmjs repository

### package managers

You can install net-monitor from the [npmjs repository](https://www.npmjs.com/) using your favorite package manager: [npm](https://www.npmjs.com/docs/orgs/) or [yarn](https://yarnpkg.com/	) (avoid using [bower](https://bower.io/blog/2017/how-to-migrate-away-from-bower/) for new client side modules). This will install net-monitor and its dependencies.

You can also access the dedicated page on npmjs: https://www.npmjs.com/package/@fenyo/net-monitor

### npm

`npm install @fenyo/net-monitor --save`

### yarn

`yarn add @fenyo/net-monitor`

### select the correct build

There are two different builds available:

- A bundle build with dependencies: 
`src/main/javascript/public/net-monitor.bundle.min.js`

- A standalone build:
`src/main/javascript/public/net-monitor.standalone.min.js`

## Install from the Cloudflare CDN

### base URL
The Cloudflare base URL that contains each build is https://eowyn.eu.org/cloudflare/

### select the correct build

- Standalone builds are available using this template:
net-monitor-[VERSION].standalone.min.js

  Example: https://eowyn.eu.org/cloudflare/net-monitor-1.0.10.standalone.min.js

  The latest standalone build is https://eowyn.eu.org/cloudflare/net-monitor-latest.standalone.min.js

- Bundle builds are available using this template:
net-monitor-[VERSION].bundle.min.js

  Example: https://eowyn.eu.org/cloudflare/net-monitor-1.0.10.bundle.min.js

  The latest bundle build is https://eowyn.eu.org/cloudflare/net-monitor-latest.bundle.min.js

# Client integration

net-monitor can be integrated with plain JavaScript or with different module loaders. The examples below show how to load net-monitor in different systems.

## script tag with bundle build

````html
<script src="javascript/public/net-monitor.bundle.min.js"></script>
<script>
    var charts = { ... };
    var manager = NetMonitor.manage(charts);
</script>
````

## script tag with standalone build

Note that the dependencies are also installed on the server.

````html
<script src="jquery/dist/jquery.min.js"></script>
<script src="moment/moment.js"></script>
<script src="webstomp-client/dist/webstomp.min.js"></script>
<script src="chart.js/dist/Chart.bundle.min.js"></script>
<script src="javascript/public/net-monitor.standalone.min.js"></script>
<script>
    var charts = { ... };
    var manager = NetMonitor.manage(charts);
</script>
````

## ES6 module

```javascript
import NetMonitor from 'net-monitor.bundle.min.js';
var charts = { ... };
var manager = NetMonitor.manage(charts);
```

## common JS

```javascript
var NetMonitor = require('net-monitor.bundle.min.js');
var charts = { ... };
var manager = NetMonitor.manage(charts);
```

# Build from sources

If you want to contribute to net-monitor, you can build it from the sources with the following recipes.

## Linux + Maven

### first installation

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
if you do not bind to a recent repository, the node version installed may be too much older to work correctly with yarn (see yarn installation below).

      Note 2:
a recent version of npm has been installed, as a dependency of this recent nodejs.

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

  - Now, you can access the demo application on: http://localhost:8080/net-monitor

    From a remote host, use: http://HOSTNAME:8080/net-monitor

  - The module is available here: http://HOSTNAME:8080/net-monitor/javascript/public/net-monitor.min.js

### updates

After having updated some source files, just run the following command lines to take updates into account:
````bash
user% npx webpack
user% mvn compile install
user% mvn tomcat7:run-war
````

## Windows + Eclipse

### install Eclipse

The [sources available from GitHub](https://github.com/AlexandreFenyo/net-monitor) can be imported in [Eclipse](https://www.eclipse.org/) as a project with [Spring MVC](http://www.springframework.org/) and  [Maven](https://maven.apache.org/) natures.

Follow these instructions:

- a recent JDK (1.8.x or higher)
- a version of [Eclipse](https://www.eclipse.org/) (Neon.3 or higher) including STS ([Spring Tools](https://spring.io/tools/sts))
- add a tomcat (8.x or higher) server to Eclipse:
  - in Eclipse IDE, go to menu **Window > Preferences**.
  - expand the **Server > Runtime Environments** node in the _Preferences_ dialog.
  - click **Add…** to add a new server runtime environment.
  - In the _New Server Runtime Environment_ dialog, select **Apache > Apache Tomcat v...** (the latest version of Tomcat to date) and check the option _Create a new local server_

Now, go to menu **File > Import**, choose _Projects from Git_ and clone net-monitor from https://github.com/AlexandreFenyo/net-monitor.git

Finally, publish the net-monitor project into the tomcat server: open the _Servers_ view, select the server, right click and select **Add and Remove**, then add the project.

### install and run the client-side tools

- install Node.js and npm: see https://nodejs.org/en/download/

- Install yarn: see https://yarnpkg.com/lang/en/docs/install/

- Install webpack:

  `c:\> npm install -g webpack`

- Populate JavaScript module dependencies into `node_modules` repository:

  `c:\net-monitor> yarn install`

- Use webpack and Babel to transpile, add polyfill, minify and package the JavaScript module.

  `c:\net-monitor> webpack --verbose`

    This will create `src/main/javascript/public/net-monitor/net-monitor-*.js` from `src/main/javascript/src/net-monitor.js` and relative dependencies in `node_modules`

- Finally, run webpack in listen mode:

  `c:\net-monitor> webpack -w`

### start the server

You can now start the server and visit the demo on http://localhost:8080/net-monitor

Notes:
- if you apply changes to the Java sources or resources, Eclipse will automatically reload the servlet.
- If you apply changes to the `webpack.config.js` configuration file, you should restart webpack.
- If you apply changes to the JavaScript sources, you need to wait for webpack to apply changes to the src\main\javascript\public

# Support

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
eyJoaXN0b3J5IjpbLTg3NjQ0MTE0Nl19
-->