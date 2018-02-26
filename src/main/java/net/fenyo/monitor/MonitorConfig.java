package net.fenyo.monitor;

/*
 * Copyright 2018 Alexandre Fenyo - alex@fenyo.net - http://fenyo.net
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Bootstrap the management of a set of probes.
 * The dependant objects (array of probes and default_lifetime) are automatically instanciated and injected by Jackson, from a JSON configuration.
 * @author Alexandre Fenyo
 */

public class MonitorConfig {
    private static final Logger logger = LoggerFactory.getLogger(MonitorConfig.class);

	public MonitorProbe probes[];
	public long default_lifetime;

    /**
     * Initialize the SNMP engine.
     * @param none.
     */
	public static void initSnmp() throws IOException {
	    MonitorProbe.initSnmpProbes();
	}

	/**
     * Run probes.
     * @param long lifetime lifetime in seconds. Must be > 0.
     */
	public void runProbes(final WebController controller) {
	    for (int i = 0; i < probes.length; i++) probes[i].runProbe(controller);
	}
}
