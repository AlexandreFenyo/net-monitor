#!/bin/bash

if [ ! -f /config.json ]
then
  echo you must specify a config.json file - see documentation
   exit 1
fi

if [ ! -f /log4j.xml ]
then
  echo you may specify a log4j.xml file - see documentation
fi

cp /config.json /net-monitor/target/net-monitor-*-SNAPSHOT/META-INF/config.json
cp /log4j.xml /net-monitor/target/net-monitor-*-SNAPSHOT/WEB-INF/classes/log4j.xml

mvn tomcat7:run
