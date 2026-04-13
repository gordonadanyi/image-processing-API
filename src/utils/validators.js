const {body} = require('express-validator');

const signupValidator = [	
    body('username')
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3, max: 30 }).withMessage('Username must be between 3 and 30 characters')  
        .matches(/^\S+$/).withMessage('Username cannot contain spaces'),
    
    body('email')
    .isEmail().withMessage('Invalid email format')
    .notEmpty().withMessage('Email is required')
    .normalizeEmail(),	    

    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&]/).withMessage('Password must contain at least one special character (@$!%*?&)'),
];

const loginValidator = [
    body('username').notEmpty().withMessage('Username is required'),
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required')
];  

module.exports = {
    signupValidator,
    loginValidator
};