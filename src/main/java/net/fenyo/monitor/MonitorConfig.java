package net.fenyo.monitor;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class MonitorConfig {
    private static final Logger logger = LoggerFactory.getLogger(MonitorConfig.class);

	public MonitorProbe probes[];
	public long default_lifetime;

	public static void initSnmp() throws IOException {
	    MonitorProbe.initSnmpProbes();
	}

	public void runProbes(final WebController controller) {
	    for (int i = 0; i < probes.length; i++) probes[i].runProbe(controller);
	}
}
