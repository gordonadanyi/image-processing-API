// utils/response.js - Central Response Formatter

const formatResponse = (success, data = null, message = null) => {
    return {
        success,
        ...(data !== null && { data }),      // Safe spread
        ...(message && { message })
    };
};

module.exports = {
    formatResponse
};