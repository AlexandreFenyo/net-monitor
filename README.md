# Concepts

### net-monitor goal

net-monitor aims to create charts for you, in the browser, and dynamically update the data associated to those charts by talking to the server.

### data set

A net-monitor data set is a named time series (i.e. a set of time stamped collected data), maintained in the net-manager server memory. A data set typically contains numerical network throughput values collected from a snmp agent. A maximum data lifetime is associated with each data set.

For integrity purpose, data sets can only be updated by one of the following two mecanisms:

- A new data value, timestamped with the current instant (corresponding to the instant the data is added into the server memory), can be added by a net-monitor probe (typically using its internal snmp manager) or by an external web service request to the server.

  No data can be added with a timestamp in the past or the future. Therefore, the probe or the web service request that adds a new data does not need to specify a timestamp.

- When two data values become older than the data set lifetime, the oldest one is removed. Therefore, there can only be one data value older that the data set lifetime, at most.

  Keeping one data value older than the lifetime of the data set is useful to correctly draw a line chart representing the data set over its life time: to draw the first segment, having a timestamped value outside the canvas is necessary.

**To sum up, a data set has a name, a life time and contains a set of timestamped data, maintained in the net-monitor server memory.**

### Probe

A probe collects real-time data and push them to its associated data set.

There are two probe types:

- internal probes :
  such a probe runs in the net-monitor server and is associated to a data set. Each time it collects a data, this data is pushes into the data set. There is currently one type of internal probe: SNMP probes, that collect network interfaces throughput.

- external probes :
  external probes can run anywhere, they just invoke a REST/JSON web service on the server to push some real-time data to a data set.

### chart

A chart is a JavaScript object that the [Chart.js](http://www.chartjs.org/) JavaScript library uses to display time series using a html canvas.

### view

A view (or chart view) is a net-monitor JavaScript object running in the browser, that associates a chart to a subset of a data set. This subset contains only the data with a timestamp in the range from now to the latest X seconds. X denotes the lifetime of the view. There is a one-to-one association between a view and a chart.

### manager

A manager is a net-monitor JavaScript object running in the browser, that lets you delegate the management of couples of chart views and data sets. From the point of view of a manager, there is a one-to-one association between a chart view and a data set.

If you want to display multiple charts associated to the same data set, just create multiple managers. This may be useful to display different views of the same data set, for instance a short-range view populated with the last 60 seconds of data, and a long-range view populated the 2 last hours of data.

### lifetime

Up to now, we have encountered two types of lifetime:

- the lifetime associated to a data set maintained in the server: this value defines the duration before data are discarded from the data set (remember that a data set may contain one data older than the life time of the set).

  Here is the lifecycle of this lifetime:
  
  - the data set lifetime initial value is set when the data set is created:

    - when a probe adds a value to a data set with a name not already associated to an existing data set, a new data set is created. The 


# Demo

# API

## Creating a chart

## Managing a chart



# Configuration



# Server installation

The net-monitor server is made of three components:

- a REST/JSON web-services server
- a [STOMP](http://jmesnil.net/stomp-websocket/doc/) message broker over [RFC-6455](https://tools.ietf.org/html/rfc6455) [WebSocket](https://en.wikipedia.org/wiki/WebSocket) technology
- a [SNMP](https://tools.ietf.org/html/rfc1157) v1/v2c/v3 manager

All these components are packaged in a single servlet that needs a servlet container to run into. [Tomcat](http://tomcat.apache.org/) is the prefered container for this purpose.

This servlet is requested by the net-monitor JavaScript client library.

## Install with Docker

Using Docker is the prefered way to install net-monitor.

### download the image

Before running a container with the net-monitor image, you may pull the latest image from [DockerHub](https://hub.docker.com/r/fenyoa/net-monitor/). Anyway, running a container with this image will fetch the image if not already pulled.

```shell
user% docker pull fenyoa/net-monitor
```
### run a container

Before running a container, fetch the following informations:

- the TCP port number you want the servlet container to listen to:
  you will have to forward this port to the port 8080 inside the container

- the _config.json_ configuration file:
  you will have to map this file to the container root directory (`/`, not `/root`)

- optionally, the _log4j.xml_ logging rules file:
  you may map this file to the container root directory (`/`, not `/root`)

Suppose you have chosen port 8888.

You can now run the container this way, **in foreground**:

````shell
user% docker run --rm -t -i -p 8888:8080 -v $PWD/net-monitor/config.json:/config.json -v $PWD/net-monitor/log4j.xml:/log4j.xml fenyoa/net-monitor
````

You can run the container this way, **in the background** (detached mode):

````shell
user% docker run -d -p 8888:8080 -v $PWD/net-monitor/config.json:/config.json -v $PWD/net-monitor/log4j.xml:/log4j.xml fenyoa/net-monitor
````

## Install from the WAR archive in the Cloudflare CDN

### base URL
The [Cloudflare](https://www.cloudflare.com/) base URL that contains each build is https://eowyn.eu.org/cloudflare/

### select the correct build

**For compatibility purpose, the version of the net-monitor servlet must be the same as the version of the net-monitor JavaScript client library.**

Therefore, when selecting the net-monitor-[VERSION].[standalone|bundle].[min|dev].js client library, choose the corresponding net-monitor-[VERSION].war web archive with the same version.

The latest web archive build corresponding to the latest client library build is https://eowyn.eu.org/cloudflare/net-monitor-latest.war

### update the archive with the configuration file

Before pushing the net-monitor WAR archive in a servlet container, you **must** update the _META-INF/config.json_ configuration file contained in the archive.

You do not need to explode the archive to do that, you can simply use `jar` to update the configuration file the following way (we suppose you have a configuration file named _config.json_ and the WAR file in the current directory):

````shell
user% mkdir META-INF
user% cp config.json META-INF
user% jar uf net-monitor-*.war META-INF/config.json
user% rm -rf META-INF
````

### update the archive with the logging rules

Before pushing the net-monitor WAR archive in a servlet container, you **may** want to update the _WEB-INF/classes/log4j.xml_ logging rules file contained in the archive.

You do not need to explode the archive to do that, you can simply use `jar` to update the file the following way (we suppose you have a logging rules file named _log4j.xml_ and the WAR file in the current directory):

````shell
user% mkdir -p WEB-INF/classes
user% cp log4j.xml WEB-INF/classes
user% jar uf net-monitor-*.war WEB-INF/classes/log4j.xml
user% rm -rf WEB-INF
````

### run the server

Refer to your servlet container documentation (tomcat is a good choice) to find [how to publish the net-monitor war file](https://tomcat.apache.org/tomcat-8.0-doc/deployer-howto.html).

## Install from the sources

See the chapter _Build client library and server from the sources_ below to make a build.

Building with Linux + Maven, you will find the WAR archive here: _net-monitor/target/net-monitor-*-SNAPSHOT.war_

Building with Windows + Eclipse, you can [use Eclipse to export the project as war](https://help.eclipse.org/luna/index.jsp?topic=%2Forg.eclipse.wst.webtools.doc.user%2Ftopics%2Ftwcrewar.html) to get the archive.

### run the server

Refer to your servlet container documentation (tomcat is a good choice) to find [how to publish the net-monitor war file](https://tomcat.apache.org/tomcat-8.0-doc/deployer-howto.html).

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
The [Cloudflare](https://www.cloudflare.com/) base URL that contains each build is https://eowyn.eu.org/cloudflare/

### select the correct build

- Standalone builds are available using this template:
net-monitor-[VERSION].standalone.min.js

  Example: https://eowyn.eu.org/cloudflare/net-monitor-1.0.10.standalone.min.js

  The latest standalone build is https://eowyn.eu.org/cloudflare/net-monitor-latest.standalone.min.js

- Bundle builds are available using this template:
net-monitor-[VERSION].bundle.min.js

  Example: https://eowyn.eu.org/cloudflare/net-monitor-1.0.10.bundle.min.js

  The latest bundle build is https://eowyn.eu.org/cloudflare/net-monitor-latest.bundle.min.js

## Install from the sources

See the chapter _Build client library and server from the sources_ below to make a build, then fetch the JavaScript builds from the repository  src/main/javascript/public

# Client integration

net-monitor can be integrated with plain JavaScript or with different module loaders, into your web application. The examples below show how to load net-monitor in different systems.

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

# Build client library and server from the sources

If you want to contribute to net-monitor, you can build the client and server software from the sources with the following recipes.

## Linux + Maven

### first installation

Note: this example is for Linux Ubuntu 16.04 LTS.

- Download the sources

  Download from github: 

    `user% git clone https://github.com/AlexandreFenyo/net-monitor.git`
  
- JavaScript part (client module for use in browsers):

  - Install a **recent** version of Node.js:

    - Bind to a recent node repository:

      `root# curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -`

    - Install node from this repository:

      `root# apt-get install nodejs`

      Note 1:
if you do not bind to a recent repository, the node version installed may be too much older to work correctly with yarn (see yarn installation below).

      Note 2:
a recent version of npm has been installed, as a dependency of this recent Node.js.

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

- Access to the generated resources:

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
- If you apply changes to the `webpack.config.js` configuration file, you should restart webpack and restart the server.
- If you apply changes to the JavaScript sources in `src\main\javascript\src`, you need to wait for webpack to apply changes into the `src\main\javascript\public` directory. Then refresh the project in the _Project Explorer_ window (select the project and type F5), for Eclipse to publish the new bundle and standalone builds.

## debugging JavaScript client library

Two debugging builds are available from the [npmjs](https://www.npmjs.com/) repository, the Cloudflare CDN and the JEE server: just replace _min_ with _dev_ in the path to the JavaScript resources.

Those builds are:
- not processed with [Babel](https://babeljs.io/)
- not minified
- not transpiled, so written with a subset of pure [ECMAScript® 2015](http://www.ecma-international.org/ecma-262/6.0/)
- free of any Polyfill

For instance, on Cloudflare, you can access the debugging resources here:

- standalone debugging build:
[https://eowyn.eu.org/cloudflare/net-monitor-latest.standalone.dev.js](https://eowyn.eu.org/cloudflare/net-monitor-latest.standalone.dev.js)

- bundle debugging build:
[https://eowyn.eu.org/cloudflare/net-monitor-latest.bundle.dev.js](https://eowyn.eu.org/cloudflare/net-monitor-latest.bundle.dev.js)

Using the standalone debugging build is the easiest way to update and debug this software.

# Support

Best-effort support is available here :

![support](docs/support.png)

----------

written with StackEdit - Support StackEdit

[![](https://cdn.monetizejs.com/resources/button-32.png)](https://monetizejs.com/authorize?client_id=ESTHdCYOi18iLhhO&summary=true)

[StackEdit](https://stackedit.io/) is a full-featured, open-source Markdown editor based on PageDown, the Markdown library used by Stack Overflow and the other Stack Exchange sites.

<!--stackedit_data:
eyJoaXN0b3J5IjpbLTU0NzAzMjQzN119
-->
<!--stackedit_data:
eyJoaXN0b3J5IjpbMzk5NjA5Njg0XX0=
-->