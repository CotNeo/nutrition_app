/**
 * Logger utility for consistent logging across the application
 * Follows the project's debugging and logging rules
 */

export class Logger {
  /**
   * Logs informational messages with context
   * @param module Module or component name
   * @param message Log message
   * @param data Optional data to log
   */
  static log(module: string, message: string, data?: any): void {
    if (data) {
      console.log(`[${module}] ${message}`, data);
    } else {
      console.log(`[${module}] ${message}`);
    }
  }

  /**
   * Logs error messages with context
   * @param module Module or component name
   * @param message Error message
   * @param error Error object or data
   */
  static error(module: string, message: string, error?: any): void {
    if (error) {
      console.error(`[${module}] ${message}`, error);
    } else {
      console.error(`[${module}] ${message}`);
    }
  }

  /**
   * Logs warning messages with context
   * @param module Module or component name
   * @param message Warning message
   * @param data Optional data to log
   */
  static warn(module: string, message: string, data?: any): void {
    if (data) {
      console.warn(`[${module}] ${message}`, data);
    } else {
      console.warn(`[${module}] ${message}`);
    }
  }

  /**
   * Creates a grouped log section for better organization
   * @param groupName Name of the log group
   * @param logs Object containing log entries
   */
  static group(groupName: string, logs: Record<string, any>): void {
    console.group(groupName);
    Object.entries(logs).forEach(([key, value]) => {
      console.log(`${key}:`, value);
    });
    console.groupEnd();
  }
}

