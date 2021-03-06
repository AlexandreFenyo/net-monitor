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
 * An exception for errors specific to this software.
 * @author Alexandre Fenyo
 */

public class MonitorException extends Exception {
  public static final long serialVersionUID = 1L;

  /**
   * Constructor.
   * Create a MonitorException instance.
   * @param none.
   */
  public MonitorException() {
   super(); 
  }

  /**
   * Constructor.
   * Creates a MonitorException instance.
   * @param message message associated with this exception.
   * @param none.
   */
  public MonitorException(final String message) {
    super(message); 
   }

  /**
   * Constructor.
   * Creates a MonitorException instance.
   * @param message message associated with this exception.
   * @param exception exception associated with this exception.
   */
  public MonitorException(final String message, final Throwable cause) {
    super(message, cause); 
   }

  /**
   * Constructor.
   * Creates a MonitorException instance.
   * @param exception exception associated with this exception.
   */
  public MonitorException(final Throwable cause) {
    super(cause);
  }
}
