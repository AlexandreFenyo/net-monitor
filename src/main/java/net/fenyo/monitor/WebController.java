
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

/**
 * Web sockets dispatcher and web services controller
 * @author Alexandre Fenyo
 */

import java.io.*;
import java.security.Principal;
import java.util.*;

import javax.servlet.*;

import org.slf4j.*;
import org.springframework.beans.factory.annotation.*;
import org.springframework.context.event.*;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.*;
import org.springframework.web.bind.annotation.*;
import com.fasterxml.jackson.core.*;
import com.fasterxml.jackson.databind.*;

/**
 * Spring controller.
 * Dispatch STOMP messages to browsers, send data sets content to requesting browsers.
 * @author Alexandre Fenyo
 */

@RestController
public class WebController {
    private static final Logger logger = LoggerFactory.getLogger(WebController.class);
    private SimpMessagingTemplate template;

    @Autowired
    private ServletContext context;
    
    MonitorConfig config = null;

    private Map<String, DataSet> data_sets = Collections.synchronizedMap(new HashMap<String, DataSet>());

    /**
     * Constructor.
     * Create a MonitorException instance.
     * @param SimpMessagingTemplate template object used to send STOMP messages to browsers.
     */
    @Autowired
	public WebController(final SimpMessagingTemplate template) {
		this.template = template;
	}

    /**
     * Parse configuration file to instantiate probe instances.
     * @param none.
     */
    @EventListener(ContextRefreshedEvent.class)
    public void contextRefreshedEvent() throws JsonParseException, JsonMappingException, IOException {
    	final ObjectMapper objectMapper = new ObjectMapper();
    	final InputStream is = context.getResourceAsStream("META-INF/config.json");
    	objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    	config = objectMapper.readValue(is, MonitorConfig.class);
        MonitorConfig.initSnmp();
    	config.runProbes(this);
    }

    /**
     * Answer to HTTP requests to add a value to a data set and publish this value to the STOMP message broker.
     * This is *not* called by internal probes.
     * @param long value numeric value.
     * @param String data data set name.
     * @param long lifetime new lifetime for this data set. Must be >= -1. -1 means default value.
     */
    // http://localhost:8080/net-monitor/dispatch/add?value=123&dataset=dataset1
    // http://localhost:8080/net-monitor/dispatch/add?value=123&dataset=dataset1&lifetime=60
    @RequestMapping(value = "/add", method = RequestMethod.GET)
    @CrossOrigin(origins = "*")
    public Boolean add(final Principal p, @RequestParam("value") final long value, @RequestParam("dataset") final String dataset, @RequestParam(value = "lifetime", defaultValue = "0", required = false) long lifetime) throws MonitorException {
        if (lifetime < -1) throw new MonitorException("add op.: invalid lifetime value [" + lifetime + "] for dataset [" + dataset + "]");
        if (lifetime == -1) lifetime = config.default_lifetime;
        _add(value, dataset, lifetime);
        return true;
    }

    /**
     * Add a value to a data set and publish this value to the STOMP message broker.
     * This may be called by internal or external probes.
     * @param long value numeric value.
     * @param String dataset data set name.
     * @param long lifetime new lifetime for this data set. Must be >= 0. 0 means no lifetime change if the data set already exists. Otherwise, 0 means no persistence.
     */
    public void _add(final long value, final String dataset, final long lifetime) throws MonitorException {
        final DataSet data;

        synchronized (data_sets) {
            if (!data_sets.containsKey(dataset)) {
                data_sets.put(dataset, new DataSet(lifetime));
            }
            data = data_sets.get(dataset);
        }

        final long idx = data.addValue(new Long(value).toString(), lifetime);
        final String text = "{\"index\":" + idx + ",\"time\":0,\"value\":" + new Long(value).toString() + "}";

        // simulate loss
        if (new Random().nextInt(10) == 0) return;

        template.convertAndSend("/data/" + dataset, text);
    }

    /**
     * Answer to browser requests to get initial data.
     * @param String dataset data set name.
     * @param long lifetime new lifetime for this data set. Must be >= 0. 0 means no lifetime change if the data set already exists. Otherwise, 0 means no persistence.
     */
    // curl -v --header "Accept: application/json" http://localhost:8080/net-monitor/dispatch/request?dataset=dataset1&lifetime=60
    // lifetime >= 0
    @RequestMapping(value = "/request", method = RequestMethod.GET)
    @CrossOrigin(origins = "*")
    public Data [] request(final Principal p, @RequestParam("dataset") final String dataset, @RequestParam("lifetime") final long lifetime) throws MonitorException {
        if (lifetime == -1) throw new MonitorException("request op.: invalid lifetime value [" + lifetime + "] for dataset [" + dataset + "]");
    	synchronized (data_sets) {
    		if (!data_sets.containsKey(dataset)) data_sets.put(dataset, new DataSet(lifetime));
    	}
        data_sets.get(dataset).extend(lifetime);
        return data_sets.get(dataset).toArray(lifetime);
    }
}
