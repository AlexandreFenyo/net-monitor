package fenyo.net.monitor;

import java.net.URL;
import java.nio.charset.Charset;
import java.security.Principal;
import java.util.List;
import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.view.RedirectView;

@Controller
public class WebController {
    private static final Logger logger = LoggerFactory.getLogger(WebController.class);

    @RequestMapping(value = "/request", method = RequestMethod.GET)
    public ModelAndView user(final Principal p) {
        logger.debug("salut");
        final ModelAndView mav = new ModelAndView("user");
        return mav;
    }

}
