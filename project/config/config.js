const config = {
    development: {
        port: process.env.PORT || 3000,
        mongodb: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/customer_db',
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        },
        cors: {
            origin: '*',
            credentials: true
        }
    },
    production: {
        port: process.env.PORT || 3000,
        mongodb: {
            uri: process.env.MONGODB_URI,
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        },
        cors: {
            origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
            credentials: true
        }
    },
    test: {
        port: process.env.PORT || 3001,
        mongodb: {
            uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/customer_test_db',
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        },
        cors: {
            origin: '*',
            credentials: true
        }
    }
};

const environment = process.env.NODE_ENV || 'development';
module.exports = config[environment];
