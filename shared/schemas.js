// Note: Consumers must install 'joi'
const Joi = require('joi');

const signupSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const profileSchema = Joi.object({
    name: Joi.string().min(2),
    title: Joi.string().allow('', null),
    bio: Joi.string().allow('', null),
    timezone: Joi.string(),
    responseTime: Joi.string()
});

const availabilitySchema = Joi.object({
    dayOfWeek: Joi.string().valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday').required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    isAvailable: Joi.boolean()
});

const requestSchema = Joi.object({
    hostId: Joi.string().required(),
    visitorEmail: Joi.string().email().required(),
    visitorName: Joi.string().required(),
    message: Joi.string().required()
});

const bookingSchema = Joi.object({
    hostId: Joi.string().required(),
    startTime: Joi.date().iso().required(),
    endTime: Joi.date().iso().required(),
    visitorEmail: Joi.string().email().required(),
    visitorName: Joi.string().required()
});

module.exports = {
    signupSchema,
    loginSchema,
    profileSchema,
    availabilitySchema,
    requestSchema,
    bookingSchema
};
