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

import java.io.*;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.*;
import org.snmp4j.*;
import org.snmp4j.smi.*;
import org.snmp4j.mp.*;
import org.snmp4j.transport.*;
import org.snmp4j.event.*;
import org.snmp4j.security.*;

/**
 * Get probe samples and add the captured values into the associated data set, using a dedicated thread.
 * @author Alexandre Fenyo
 */

public class MonitorProbe implements Runnable {
    private static final Logger logger = LoggerFactory.getLogger(MonitorProbe.class);

    public String dataset;
    public Long lifetime;
    public String type;
    public String version;
    public String agent;
    public String community;
    public String sec_level;
    public String auth_algo;
    public String priv_algo;
    public String username;
    public String password_auth;
    public String password_priv;
    public String oid;
    public Long rate;

    private WebController controller;
    private static Snmp snmp;
    private static TransportMapping transport;

    private static Map<String, SnmpV3User> users_v3 = new HashMap<String, SnmpV3User>();

    /**
     * Constructor.
     * Link the the SNMP library.
     * @param none.
     */

    public static void initSnmpProbes() throws IOException {
        transport = new DefaultUdpTransportMapping();
        snmp = new Snmp(transport);
        final USM usm = new USM(SecurityProtocols.getInstance(), new OctetString(MPv3.createLocalEngineID()), 0);
        SecurityModels.getInstance().addSecurityModel(usm);
        transport.listen();
    }

    /**
     * Create a thread to capture data.
     * @param WebController controller associated controller, used to add values to the the data set.
     */
    public void runProbe(final WebController controller) {
        this.controller = controller;
        new Thread(this).start();
    }

    /**
     * Capture loop.
     * @param none.
     */
    public void run() {
        Target target = null;
        Address targetAddress;
        int sec_level_index;
        OID auth_type = null, priv_type = null;

        targetAddress = GenericAddress.parse("udp:" + agent + "/161");

        if (dataset == null) {
            logger.error("Configuration error: probe without dataset");
            return;
        }

        if (lifetime == null) {
            logger.error("Configuration error: lifetime should be defined");
            return;
        }

        if (lifetime < 0) {
            logger.error("Configuration error: lifetime should be positive or null");
            return;
        }

        if (type == null) {
            logger.error("Configuration error: type should be defined");
            return;
        }

        if (!type.equals("snmp")) {
            logger.error("Configuration error: invalid type");
            return;
        }

        if (version == null) {
            logger.error("Error: snmp version should be defined");
            return;
        }

        if (!version.equals("v1") && !version.equals("v2c") && !version.equals("v3")) {
            logger.error("Error: invalid SNMP version:" + version);
            return;
        }
        
        if (!version.equals("v3")) {
            if (!version.equals("v1") && !version.equals("v2c")) {
                logger.error("Error: version should be v1, v2c or v3");
                return;
            }
            
            target = new CommunityTarget();
            target.setVersion((version.equals("v1")) ? SnmpConstants.version1 : SnmpConstants.version2c);

            if (community == null) {
                logger.error("Error: community should be defined with v1 or v2c");
                return;
            }

            ((CommunityTarget) target).setCommunity(new OctetString(community));
            ((CommunityTarget) target).setAddress(targetAddress);

            if (username != null) {
                logger.error("Error: username should not be defined with v1 or v2c");
                return;
            }

            if (sec_level != null) {
                logger.error("Error: sec_level should not be defined with v1 or v2c");
                return;
            }

            if (auth_algo != null) {
                logger.error("Error: auth_algo should not be defined with v1 or v2c");
                return;
            }
            
            if (priv_algo != null) {
                logger.error("Error: priv_algo should not be defined with v1 or v2c");
                return;
            }
            
            if (password_auth != null) {
                logger.error("Error: password_auth should not be defined with v1 or v2c");
                return;
            }

            if (password_priv != null) {
                logger.error("Error: password_priv should not be defined with v1 or v2c");
                return;
            }

        } else {

            if (community != null) {
                logger.error("Error: community should not be defined with v3");
                return;
            }

            if (username == null) {
                logger.error("Error: username should be defined with v3");
                return;
            }

            if (sec_level == null) {
                logger.error("Error: sec_level should be defined with v3");
                return;
            }

            if (!sec_level.equals("noAuthNoPriv") && !sec_level.equals("authNoPriv") && !sec_level.equals("authPriv")) {
                logger.error("Error: sec_level should be noAuthNoPriv, authNoPriv or authPriv");
                return;
            }

            if (sec_level.equals("noAuthNoPriv")) {
                if (auth_algo != null) {
                    logger.error("Error: auth_algo should not be defined with noAuthNoPriv");
                    return;
                }

                if (priv_algo != null) {
                    logger.error("Error: priv_algo should not be defined with noAuthNoPriv");
                    return;
                }
                
                sec_level_index = SecurityLevel.NOAUTH_NOPRIV;
            } else if (sec_level.equals("authNoPriv")) {
                if (auth_algo == null) {
                    logger.error("Error: auth_algo should not defined with authNoPriv");
                    return;
                }

                if (priv_algo != null) {
                    logger.error("Error: priv_algo should not be defined with authNoPriv");
                    return;
                }
                
                sec_level_index = SecurityLevel.AUTH_NOPRIV;
            } else {
                if (auth_algo == null) {
                    logger.error("Error: auth_algo should defined with authPriv");
                    return;
                }

                if (priv_algo == null) {
                    logger.error("Error: priv_algo should be defined with authPriv");
                    return;
                }
                
                if (priv_algo.equals("DES")) priv_type = PrivDES.ID;
                else if (priv_algo.equals("3DES")) priv_type = Priv3DES.ID;
                else if (priv_algo.equals("AES128")) priv_type = PrivAES128.ID;
                else if (priv_algo.equals("AES192")) priv_type = PrivAES192.ID;
                else if (priv_algo.equals("AES256")) priv_type = PrivAES256.ID;
                else {
                    logger.error("Error: priv_algo should be DES, 3DES, AES128, AES192 or AES256");
                    return;
                }
                
                sec_level_index = SecurityLevel.AUTH_PRIV;
            }
            
            if (sec_level.startsWith("auth")) {
                if (auth_algo.equals("MD5")) auth_type = AuthMD5.ID;
                else if (auth_algo.equals("SHA128")) auth_type = AuthSHA.ID;
                else if (auth_algo.equals("SHA224")) auth_type = AuthHMAC128SHA224.ID;
                else if (auth_algo.equals("SHA256")) auth_type = AuthHMAC192SHA256.ID;
                else if (auth_algo.equals("SHA384")) auth_type = AuthHMAC256SHA384.ID;
                else if (auth_algo.equals("SHA512")) auth_type = AuthHMAC384SHA512.ID;
                else {
                    logger.error("Error: auth_algo should be MD5, SHA128, SHA224, SHA256, SHA384 or SHA512");
                    return;
                }
            }

            boolean need_add_user = false;
            synchronized (users_v3) {
                if (users_v3.containsKey(username)) {
                    if ((users_v3.get(username).sec_level == null && sec_level != null) ||
                            (users_v3.get(username).sec_level != null && !users_v3.get(username).sec_level.equals(sec_level)) ||
                            (users_v3.get(username).auth_algo == null && auth_algo != null) ||
                            (users_v3.get(username).auth_algo != null && !users_v3.get(username).auth_algo.equals(auth_algo)) ||
                            (users_v3.get(username).priv_algo == null && priv_algo != null) ||
                            (users_v3.get(username).priv_algo != null && !users_v3.get(username).priv_algo.equals(priv_algo)) ||
                            (users_v3.get(username).password_auth == null && password_auth != null) ||
                            (users_v3.get(username).password_auth != null && !users_v3.get(username).password_auth.equals(password_auth)) ||
                            (users_v3.get(username).password_priv == null && password_priv != null) ||
                            (users_v3.get(username).password_priv != null && !users_v3.get(username).password_priv.equals(password_priv))
                            ) {
                        logger.error("shared users must have the same parameter values");
                        return;
                    }
                } else {
                    final SnmpV3User user_v3 = new SnmpV3User();
                    user_v3.sec_level = sec_level;
                    user_v3.auth_algo = auth_algo;
                    user_v3.priv_algo = priv_algo;
                    user_v3.password_auth = password_auth;
                    user_v3.password_priv = password_priv;
                    users_v3.put(username, user_v3);
                    need_add_user = true;
                }
            }

            if (need_add_user) snmp.getUSM().addUser(new OctetString(username),
                    new UsmUser(new OctetString(username),
                            auth_type, (auth_type != null ? new OctetString(password_auth) : null),
                            priv_type, (priv_type != null ? new OctetString(password_priv) : null)));

            target = new UserTarget(targetAddress, new OctetString(username), new byte[] {}, sec_level_index);
            target.setVersion(SnmpConstants.version3);
        }
        
        target.setRetries(3);
        target.setTimeout(1500);
        target.setMaxSizeRequestPDU(1000);

        final PDU requestPDU;
          
        if (version.equals("v1")) {
              requestPDU = new PDUv1();
          } else if (version.equals("v2c")) {
              requestPDU = new PDU();
          } else requestPDU = new ScopedPDU();

          final OID _oid = new OID(oid);
          requestPDU.add(new VariableBinding(_oid));
          requestPDU.setType(PDU.GET);
          
          long current = 0;
          long current_timestamp = 0;
          boolean current_isset = false;

          while (true) {
              PDU responsePDU;
              ResponseEvent response;
              
              try {
                  Thread.sleep(1000 / rate);
              } catch (final InterruptedException e) {
                  logger.warn(e.toString());
              }

              try {
                  response = snmp.send(requestPDU, target, transport);
              } catch (final Exception e) {
                  // typically to manage "org.snmp4j.MessageException: No route to host (sendto failed)"
                  logger.warn("Exception when requesting SNMP agent: " + e.toString());
                  try {
                      Thread.sleep(1000);
                  } catch (final InterruptedException e2) {
                      logger.error(e2.toString());
                  }
                  continue;
              }

              if (response == null) {
                  logger.warn("SNMP response is null");
                  current_isset = false;
              } else {
                  responsePDU = response.getResponse();
                  if (responsePDU == null) {
                      logger.warn("SNMP response PDU is null");
                      current_isset = false;
                  } else {
                      long now = System.currentTimeMillis();
                      final long value = responsePDU.getVariable(_oid).toLong();
                      
                      if (current_isset == false) {
                          current = value;
                          current_timestamp = now;
                          current_isset = true;
                          continue;
                      }
                      
                      if (value != current) {
                          final long throughput = (8 * 1000 * (value - current)) / (now - current_timestamp);
                          if (throughput < 0) {
                              logger.warn("negative throughput");
                              current_isset = false;
                              continue;
                          }
                          
                          try {
                              controller._add(throughput, dataset, lifetime);
                          } catch (MonitorException e) {
                              logger.error(e.toString());
                          }
                          current = value;
                          current_timestamp = now;
                      }
                  }
              }
          }
    }
}
