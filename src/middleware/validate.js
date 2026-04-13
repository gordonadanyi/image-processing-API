const { validationResult } = require('express-validator');
const { body } = require('express-validator');
const { param } = require('express-validator')

const validate = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array(),
        });
    }

    next();
};

const idValidator = [
    param('íd').isMongoId().withMessage('Invalid image ID')
];

const uploadValidator = [
    body('image').custom((value, { req })=>{
        if(!req.file){
            throw new Error('Image file is required')
        }
        return true;
    }),
];

const refreshValidator = [
    body('refreshToken').notEmpty().withMessage('Refresh token required'),
];

const logoutValidator = [
    body('refreshToken').notEmpty().withMessage('Refresh Token required'),
];

module.exports = {
    validate,
    refreshValidator,
    logoutValidator,
    idValidator,
    uploadValidator
};