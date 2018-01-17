package fenyo.net.monitor;

import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.TextMessage;

public class SocketHandler extends TextWebSocketHandler {
    @Override
    public void handleTextMessage(final WebSocketSession session, final TextMessage message) {
        System.out.println("message received");
        if (message.equals("canstart")) {
            System.out.println("canstart received");
        }
    }
}
