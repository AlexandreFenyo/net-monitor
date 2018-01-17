package fenyo.net.monitor;

import javax.servlet.ServletContext;
import javax.servlet.ServletRegistration;

import org.springframework.web.WebApplicationInitializer;
import org.springframework.web.context.support.AnnotationConfigWebApplicationContext;
import org.springframework.web.servlet.DispatcherServlet;

public class MyWebAppInitializer implements WebApplicationInitializer {
    @Override
    public void onStartup(final ServletContext servletCxt) {

      // Load Spring web application configuration
      final AnnotationConfigWebApplicationContext appCtx = new AnnotationConfigWebApplicationContext();
      appCtx.register(AppConfig.class);
      appCtx.refresh();

      // Create DispatcherServlet
      final DispatcherServlet servlet = new DispatcherServlet(appCtx);

      // Register and map the Servlet
      final ServletRegistration.Dynamic registration = servletCxt.addServlet("dispatch", servlet);
      registration.setLoadOnStartup(1);
      registration.addMapping("/socket/*");
    }
}