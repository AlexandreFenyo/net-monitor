
# docker run -p 8888:80 -v $PWD/net-monitor/config.json:/net-monitor/src/main/webapp/META-INF/config.json -v $PWD/net-monitor/log4j.xml:/net-monitor/src/main/resources/log4j.xml -t -i fenyoa/net-monitor bash

all:
	@cat Makefile

build-net-monitor:
	@cd net-monitor && docker build -t fenyoa/net-monitor .

build-net-monitor-no-cache:
	@cd net-monitor && docker build --no-cache=true -t fenyoa/net-monitor .

push-net-monitor:
	@docker push fenyoa/net-monitor

run-net-monitor:
	@docker run --rm -t -i -p 8888:8080 -v ${PWD}/net-monitor/config.json:/config.json -v ${PWD}/net-monitor/log4j.xml:/log4j.xml fenyoa/net-monitor

