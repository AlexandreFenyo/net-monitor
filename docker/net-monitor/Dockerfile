From ubuntu:xenial
MAINTAINER Alexandre Fenyo <alex@fenyo.net>
EXPOSE 8080
ENV TERM vt100
ENV LANG C.UTF-8
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
RUN apt-get update && apt-get install -y --allow-downgrades --allow-remove-essential --allow-change-held-packages libterm-ui-perl less zsh vim telnet net-tools openjdk-8-jdk git maven curl
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn
RUN git clone https://github.com/AlexandreFenyo/net-monitor.git
WORKDIR "/net-monitor"
RUN yarn install && npx webpack
RUN mvn clean compile
RUN mvn war:exploded
CMD ["mvn", "tomcat7:run"]
