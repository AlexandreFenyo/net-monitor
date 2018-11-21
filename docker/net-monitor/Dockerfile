From ubuntu:xenial
MAINTAINER Alexandre Fenyo <alex@fenyo.net>
EXPOSE 8080
ENV TERM vt100
ENV LANG C.UTF-8
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
RUN apt-get update && apt-get install -y --allow-downgrades --allow-remove-essential --allow-change-held-packages libterm-ui-perl less zsh vim telnet net-tools openjdk-8-jdk git maven curl
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
# prevent docker from caching the git repository content by adding the version history content to a dummy file
ADD https://api.github.com/repos/AlexandreFenyo/net-monitor/git/refs/head version.json
RUN git clone https://github.com/AlexandreFenyo/net-monitor.git
WORKDIR "/net-monitor"
RUN npm install -D && npx webpack
RUN mvn clean compile
RUN mvn war:exploded
# this call to tomcat7:deploy will exit with an error but it will download the dependencies we want to download now, not at container startup
RUN mvn tomcat7:deploy || true
ADD startup.sh startup.sh
CMD ["bash", "startup.sh"]
