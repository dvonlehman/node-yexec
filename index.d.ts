export type LogLevel = 'info' | 'warn' | 'error';

export interface IExecOptions {
  cwd: string;
  env?: object;
  executable: string;
  args?: string[];
  logger?: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
  logFilter?: (level: LogLevel, msg: string) => boolean | RegExp[];
  timeout?: number;
}

export default function(options: IExecOptions): Promise<void>;
