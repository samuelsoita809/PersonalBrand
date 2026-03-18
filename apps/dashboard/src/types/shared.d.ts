declare module '@monorepo/shared' {
  export function createLogger(name: string): {
    info: (msg: string, ...args: any[]) => void;
    error: (msg: string, ...args: any[]) => void;
    warn: (msg: string, ...args: any[]) => void;
    debug: (msg: string, ...args: any[]) => void;
  };
}
