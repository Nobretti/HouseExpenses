import { Platform } from 'react-native';
import { storage } from '../utils/storage';

export interface ErrorLog {
  id: string;
  timestamp: string;
  type: 'api' | 'runtime' | 'network' | 'validation';
  message: string;
  details?: string;
  stack?: string;
  context?: Record<string, unknown>;
  url?: string;
  statusCode?: number;
}

const ERROR_STORAGE_KEY = '@house_expenses_error_logs';
const MAX_ERROR_LOGS = 50;

class ErrorMonitor {
  private logs: ErrorLog[] = [];
  private initialized = false;

  async initialize() {
    if (this.initialized) return;
    try {
      const stored = await storage.getItemAsync(ERROR_STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
      this.initialized = true;
    } catch (e) {
      console.warn('Failed to load error logs:', e);
      this.logs = [];
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private async saveLogs() {
    try {
      // Keep only the most recent logs
      if (this.logs.length > MAX_ERROR_LOGS) {
        this.logs = this.logs.slice(-MAX_ERROR_LOGS);
      }
      await storage.setItemAsync(ERROR_STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.warn('Failed to save error logs:', e);
    }
  }

  async logError(error: Omit<ErrorLog, 'id' | 'timestamp'>) {
    await this.initialize();

    const logEntry: ErrorLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      ...error,
    };

    this.logs.push(logEntry);
    await this.saveLogs();

    // Console log in development
    if (__DEV__) {
      console.error(`[${logEntry.type.toUpperCase()}] ${logEntry.message}`, {
        details: logEntry.details,
        context: logEntry.context,
        stack: logEntry.stack,
      });
    }

    return logEntry;
  }

  async logApiError(
    url: string,
    statusCode: number,
    message: string,
    details?: unknown
  ) {
    return this.logError({
      type: 'api',
      message,
      url,
      statusCode,
      details: typeof details === 'string' ? details : JSON.stringify(details),
      context: {
        platform: Platform.OS,
        version: Platform.Version,
      },
    });
  }

  async logNetworkError(url: string, error: Error) {
    return this.logError({
      type: 'network',
      message: `Network request failed: ${error.message}`,
      url,
      stack: error.stack,
      context: {
        platform: Platform.OS,
      },
    });
  }

  async logRuntimeError(error: Error, componentName?: string) {
    return this.logError({
      type: 'runtime',
      message: error.message,
      stack: error.stack,
      context: {
        component: componentName,
        platform: Platform.OS,
      },
    });
  }

  async logValidationError(message: string, context?: Record<string, unknown>) {
    return this.logError({
      type: 'validation',
      message,
      context,
    });
  }

  async getLogs(): Promise<ErrorLog[]> {
    await this.initialize();
    return [...this.logs].reverse(); // Return newest first
  }

  async getRecentLogs(count: number = 10): Promise<ErrorLog[]> {
    await this.initialize();
    return [...this.logs].reverse().slice(0, count);
  }

  async clearLogs() {
    this.logs = [];
    await storage.deleteItemAsync(ERROR_STORAGE_KEY);
  }

  async getLogCount(): Promise<number> {
    await this.initialize();
    return this.logs.length;
  }

  async getLogsByType(type: ErrorLog['type']): Promise<ErrorLog[]> {
    await this.initialize();
    return this.logs.filter(log => log.type === type).reverse();
  }
}

export const errorMonitor = new ErrorMonitor();
