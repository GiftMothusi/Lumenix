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


const DEV_API_URL = process.env.REACT_APP_DEV_API_URL || 'http://localhost:3000/api';
const PROD_API_URL = process.env.REACT_APP_PROD_API_URL || 'https://your-production-api.com/api';


const config: Config = {
    apiUrl: process.env.REACT_APP_API_URL || (process.env.REACT_APP_ENV === 'production' ? PROD_API_URL : DEV_API_URL),
    env: process.env.REACT_APP_ENV || 'development',
    version: process.env.REACT_APP_VERSION || '0.0.1',
    isProduction: process.env.REACT_APP_ENV === 'production',
    isDevelopment: process.env.REACT_APP_ENV === 'development',
    authConfig: {
        tokenExpiration: 1 * 60 * 60 * 1000,
        refreshThreshold: 5 * 60 * 1000,
        maxLoginAttempts: 5,
        lockoutDuration: 15 * 60 * 1000,
    },
};

export default config;
