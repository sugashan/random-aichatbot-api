import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Randam AI Chatbot backend',
      version: '1.0.0',
      description: 'API documentation for Chabot application',
    },
  },
  apis: ['./src/routes/chat/**/*.js'],
};
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;