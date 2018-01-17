package fenyo.net.monitor;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.server.standard.ServletServerContainerFactoryBean;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

//@Configuration
//@EnableWebSocket
//public class WebSocketConfig implements WebSocketConfigurer {
//    @Override
//    public void registerWebSocketHandlers(final WebSocketHandlerRegistry registry) {
//            //registry.addHandler(myHandler(), "/socket").setAllowedOrigins("http://mydomain.com").addInterceptors(new HttpSessionHandshakeInterceptor());
//        registry.addHandler(myHandler(), "/socket");
//    }
//
//    @Bean
//    public WebSocketHandler myHandler() {
//        return new SocketHandler();
//    }

// marche pas
//    @Bean
//    public ServletServerContainerFactoryBean createWebSocketContainer() {
//        final ServletServerContainerFactoryBean container = new ServletServerContainerFactoryBean();
//        container.setMaxTextMessageBufferSize(8192);
//        container.setMaxBinaryMessageBufferSize(8192);
//        return container;
//    }
//}
