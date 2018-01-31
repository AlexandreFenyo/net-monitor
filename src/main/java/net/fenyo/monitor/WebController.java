
package net.fenyo.monitor;

import java.net.URL;
import java.nio.charset.Charset;
import java.security.Principal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

@RestController
public class WebController {
    private static final Logger logger = LoggerFactory.getLogger(WebController.class);
    private SimpMessagingTemplate template;

    private DataSet data1 = new DataSet(120);
    
    @Autowired
	public WebController(final SimpMessagingTemplate template) {
		this.template = template;
	}

    // http://localhost:8080/net-monitor/dispatch/add?value=123
    @RequestMapping(value = "/add", method = RequestMethod.GET)
    public Boolean add(final Principal p, @RequestParam("value") final long value) {
        data1.addValue(new Long(value).toString());
        final String text = "{\"time\":0,\"value\":" + new Long(value).toString() + "}";
        template.convertAndSend("/data/queue", text);
        return true;
    }

    // curl -v --header "Accept: application/json" http://localhost:8080/net-monitor/dispatch/request
    @RequestMapping(value = "/request", method = RequestMethod.GET)
    public Data [] request(final Principal p) {
    	return data1.toArray();
    }
}
