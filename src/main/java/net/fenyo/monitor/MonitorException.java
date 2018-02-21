package net.fenyo.monitor;

/**
 * An exception for errors specific to this software.
 * @author Alexandre Fenyo
 */

public class MonitorException extends Exception {
  public static final long serialVersionUID = 1L;

  /**
   * Constructor.
   * Creates a MonitorException instance.
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
