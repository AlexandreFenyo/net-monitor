
package net.fenyo.monitor;

/**
 * Web sockets dispatcher and web services controller
 * @author Alexandre Fenyo
 */

import java.io.IOException;
import java.io.InputStream;
//import java.net.URL;
import java.nio.charset.Charset;
import java.security.Principal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Collections;

@RestController
public class WebController {
    private static final Logger logger = LoggerFactory.getLogger(WebController.class);
    private SimpMessagingTemplate template;

    @Autowired
    private ServletContext context;
    
    MonitorConfig config = null;

    private Map<String, DataSet> data_sets = Collections.synchronizedMap(new HashMap<String, DataSet>());

    @Autowired
	public WebController(final SimpMessagingTemplate template) {
		this.template = template;
	}

    @EventListener(ContextRefreshedEvent.class)
    public void contextRefreshedEvent() throws JsonParseException, JsonMappingException, IOException {
    	final ObjectMapper objectMapper = new ObjectMapper();
    	final InputStream is = context.getResourceAsStream("META-INF/config.json");
    	objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
    	config = objectMapper.readValue(is, MonitorConfig.class);
        MonitorConfig.initSnmp();
    	config.runProbes(this);
    }

    // http://localhost:8080/net-monitor/dispatch/add?value=123&dataset=dataset1
    // http://localhost:8080/net-monitor/dispatch/add?value=123&dataset=dataset1&lifetime=60
    // lifetime >= -1
    // lifetime == -1 means default value
    @RequestMapping(value = "/add", method = RequestMethod.GET)
    public Boolean add(final Principal p, @RequestParam("value") final long value, @RequestParam("dataset") final String dataset, @RequestParam(value = "lifetime", defaultValue = "0", required = false) long lifetime) throws MonitorException {
        if (lifetime < -1) throw new MonitorException("add op.: invalid lifetime value [" + lifetime + "] for dataset [" + dataset + "]");
        if (lifetime == -1) lifetime = config.default_lifetime;
        synchronized (data_sets) {
            if (!data_sets.containsKey(dataset)) {
                data_sets.put(dataset, new DataSet(lifetime));
                return true;
            } else {
                final DataSet data = data_sets.get(dataset);
                data.addValue(new Long(value).toString(), lifetime);
                final String text = "{\"time\":0,\"value\":" + new Long(value).toString() + "}";
                template.convertAndSend("/data/" + dataset, text);
                return true;
            }
        }
    }

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
