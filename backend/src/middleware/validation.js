const validate = (schema) => (req, res, next) => {
    if (!schema) return next();

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        return res.status(400).json({
            message: 'Validation Error',
            details: error.details.map((detail) => detail.message)
        });
    }
    next();
};

module.exports = validate;
