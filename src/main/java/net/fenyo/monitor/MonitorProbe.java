package net.fenyo.monitor;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.snmp4j.*;
import org.snmp4j.smi.*;
import org.snmp4j.mp.*;
import org.snmp4j.transport.*;
import org.snmp4j.util.*;
import org.snmp4j.event.*;
import org.snmp4j.security.*;

public class MonitorProbe implements Runnable {
    private static final Logger logger = LoggerFactory.getLogger(MonitorProbe.class);

    public String dataset;
    public long lifetime;
    public String type;
	public String version;
	public String agent;
	public String community;
    public String username;
    public String password_auth;
    public String password_priv;
	public String oid;
	public long rate;

	private WebController controller;
	private static Snmp snmp;

	public static void initSnmpProbes() throws IOException {
        final TransportMapping transport = new DefaultUdpTransportMapping();
        snmp = new Snmp(transport);
        final USM usm = new USM(SecurityProtocols.getInstance(), new OctetString(MPv3.createLocalEngineID()), 0);
        SecurityModels.getInstance().addSecurityModel(usm);
        transport.listen();
	}

	public void runProbe(final WebController controller) {
	    this.controller = controller;
	    new Thread(this).start();
	}

	public void run() {
	    Target target = null;
        InetAddress address;

        try {
            address = InetAddress.getByName(agent);
        } catch (final UnknownHostException e) {
            e.printStackTrace();
            return;
        }
        final int sec_level = SecurityLevel.AUTH_PRIV;

        if (version.equals("v1") || version.equals("v2c")) {
	        target = new CommunityTarget();
	        target.setAddress(new UdpAddress(address, 161));
	        target.setVersion((version.equals("v1")) ? SnmpConstants.version1 : SnmpConstants.version2c);
	        ((CommunityTarget) target).setCommunity(new OctetString(community));
	      } else {
	        try {
	          final UsmUserEntry entry = snmp.getUSM()
	              .getUserTable().getUser(new OctetString(username));
	          if (entry != null
	              && snmp.getUSM().removeUser(entry.getEngineID(),
	                  entry.getUserName()) == null)
	            logger.error("USM user not found");
	          snmp.getUSM().addUser(
	              new OctetString(username),
	              new UsmUser(new OctetString(username),
	                  sec_level != SecurityLevel.NOAUTH_NOPRIV ? AuthMD5.ID : null,
	                  sec_level != SecurityLevel.NOAUTH_NOPRIV ? new OctetString(
	                      password_auth) : null,
	                  sec_level == SecurityLevel.AUTH_PRIV ? PrivDES.ID : null,
	                  sec_level == SecurityLevel.AUTH_PRIV ? new OctetString(password_priv)
	                      : null));
	          target = new UserTarget(new UdpAddress(address, 161),
	              new OctetString(username), new byte[] {}, sec_level);
	          target.setVersion(SnmpConstants.version3);
	        } catch (final IllegalArgumentException ex) {
	          logger.error("Exception", ex);
	        }
	      }

	      target.setRetries(3);
	      target.setTimeout(1500);
	      target.setMaxSizeRequestPDU(1000);
	    
	      PDU pdu;
	      if (version.equals("v1")) {
	          pdu = new PDUv1();
	      } else if (version.equals("v2c")) {
	          pdu = new PDU();
	      } else pdu = new ScopedPDU();

	      pdu.add(new VariableBinding(new OID("1.3.6.1.2.1.1.1")));
	      pdu.setType(PDU.GETNEXT);
	      try {
            snmp.send(pdu, target, null);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
