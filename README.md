---


---

<h1 id="generate-from-sources">Generate from sources</h1>
<h2 id="generate-from-sources-1">Generate from sources</h2>
<h3 id="linux">Linux</h3>
<h4 id="first-installation">First installation</h4>
<p>Note: this example is for Linux Ubuntu 16.04 LTS.</p>
<ul>
<li>
<p>Download the sources</p>
<p>Download from github:</p>
<p><code>user% git clone https://github.com/AlexandreFenyo/net-monitor.git</code></p>
</li>
<li>
<p>JavaScript part (client module for use in browsers):</p>
<ul>
<li>
<p>Install a <strong>recent</strong> version of nodejs:</p>
<ul>
<li>
<p>Bind to a recent node repository:<br>
<code>root# curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -</code></p>
</li>
<li>
<p>Install node from this repository:<br>
<code>root# apt-get install nodejs</code></p>
<p>Note 1:<br>
If you do not bind to a recent repository, the node version installed may be too much older to work correctly with yarn (see yarn installation below).<br>
Note 2:<br>
A recent version of npm has been installed, as a dependency of this recent nodejs.</p>
</li>
</ul>
</li>
<li>
<p>Install yarn:<br>
<code>root# npm install -g yarn</code></p>
</li>
<li>
<p>Populate JavaScript module dependencies into <code>node_modules</code> repository:<br>
<code>user% yarn install</code></p>
</li>
<li>
<p>Use webpack and Babel to transpile, add polyfill, minify and package the JavaScript module:<br>
<code>user% npx webpack</code></p>
<p>This will create <code>src/main/javascript/public/net-monitor/net-monitor.min.js</code> from <code>src/main/javascript/src/net-monitor.js</code> and relative dependencies in <code>node_modules</code></p>
</li>
</ul>
</li>
<li>
<p>Java EE part (application server):</p>
<ul>
<li>
<p>Install a recent JDK to build the JEE application:<br>
<code>root# apt-get install openjdk-8-jdk</code></p>
</li>
<li>
<p>Install maven:<br>
<code>root# apt-get install maven</code></p>
</li>
<li>
<p>Build with maven:<br>
<code>user% mvn clean install</code></p>
<p>The generated WAR file is built here: <code>net-monitor/target/net-monitor-0.0.1-SNAPSHOT.war</code></p>
</li>
<li>
<p>Run this application with tomcat:<br>
<code>user% mvn tomcat7:run-war</code></p>
</li>
</ul>
</li>
<li>
<p>Access to the built resources</p>
<ul>
<li>
<p>Now, you can access the demo application on:<br>
<a href="http://localhost:8080/net-monitor">http://localhost:8080/net-monitor</a><br>
From a remote host, use:<br>
<a href="http://HOSTNAME:8080/net-monitor">http://HOSTNAME:8080/net-monitor</a></p>
</li>
<li>
<p>The module is available here:<br>
<a href="http://HOSTNAME:8080/net-monitor/javascript/public/net-monitor.min.js">http://HOSTNAME:8080/net-monitor/javascript/public/net-monitor.min.js</a></p>
</li>
</ul>
</li>
</ul>
<h4 id="update-files">Update files</h4>
<p>If you update source files, just run the following command lines to take updates into account:</p>
<pre class=" language-bash"><code class="prism  language-bash">user% npx webpack
user% mvn compile <span class="token function">install</span>
user% mvn tomcat7:run-war
</code></pre>
<h3 id="windows--eclipse">Windows + Eclipse</h3>
<h2 id="support">Support</h2>
<p>Best-effort support is available here :</p>
<p><img src="docs/support.png" alt="support"></p>
<hr>
<p>written with StackEdit - Support StackEdit</p>
<p><a href="https://monetizejs.com/authorize?client_id=ESTHdCYOi18iLhhO&amp;summary=true"><img src="https://cdn.monetizejs.com/resources/button-32.png" alt=""></a></p>
<p><a href="https://stackedit.io/">StackEdit</a> is a full-featured, open-source Markdown editor based on PageDown, the Markdown library used by Stack Overflow and the other Stack Exchange sites.</p>

