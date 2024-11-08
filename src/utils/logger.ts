export const createLogger = (module: string) => {
  return {
    debug: (message: string, ...args: any[]) => {
      if (args.length > 0) {
        console.debug(`[${module}]`, message, ...args)
      } else {
        console.debug(`[${module}]`, message)
      }
    },
    
    info: (message: string, ...args: any[]) => {
      if (args.length > 0) {
        console.info(`[${module}]`, message, ...args)
      } else {
        console.info(`[${module}]`, message)
      }
    },
    
    warn: (message: string, ...args: any[]) => {
      if (args.length > 0) {
        console.warn(`[${module}]`, message, ...args)
      } else {
        console.warn(`[${module}]`, message)
      }
    },
    
    error: (message: string, ...args: any[]) => {
      if (args.length > 0) {
        console.error(`[${module}]`, message, ...args)
      } else {
        console.error(`[${module}]`, message)
      }
    }
  }
} 