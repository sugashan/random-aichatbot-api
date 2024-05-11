import {Joi} from 'celebrate';

const userQuestion = Joi.string().required();

export const chatBodySchema = Joi.object({
    userQuestion
});
