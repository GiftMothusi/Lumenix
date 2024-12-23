interface Config {
    apiUrl: string;
    env: string;
    version: string;
    isProduction: boolean;
    isDevelopment: boolean;
    authConfig: {
        tokenExpiration: number;
        refreshThreshold: number;
        maxLoginAttempts: number;
        lockoutDuration: number;
    };
}

const config: Config = {
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
    env: process.env.REACT_APP_ENV || 'development',
    version: process.env.REACT_APP_VERSION || '0.0.1',
    isProduction: process.env.REACT_APP_ENV === 'production',
    isDevelopment: process.env.REACT_APP_ENV === 'development',
    authConfig: {
        tokenExpiration: 1 * 60 * 60 * 1000, // 1 hour in milliseconds
        refreshThreshold: 5 * 60 * 1000, // 5 minutes in milliseconds
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000, // 15 minutes in milliseconds
    },
};

export default config;
