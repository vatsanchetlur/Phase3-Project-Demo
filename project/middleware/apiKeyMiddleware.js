/**
 * API Key Middleware
 * Validates the x-api-key header against the API_KEY environment variable
 */

function requireApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'API Key is missing',
            message: 'API Key is missing'
        });
    }
    
    if (apiKey !== process.env.API_KEY) {
        return res.status(403).json({
            success: false,
            error: 'API Key is invalid',
            message: 'API Key is invalid'
        });
    }
    
    next();
}

module.exports = requireApiKey;
