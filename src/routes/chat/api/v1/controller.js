import express from 'express';
import { handleError } from '../../../../util/errorUtils.js';
import { celebrate } from 'celebrate';
import { chatBodySchema } from './schema.js';
import initConversation from '../../openai.assistant.service.js';

const router = express.Router();

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Weather summary from AI for last 14 days.
 *     description: Retrieve last 14 days weather summary for a location.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: chatInputBody
 *         description: chat prompt body
 *         in: body
 *         schema:
 *            type: object
 *            required:
 *              - userQuestion
 *            properties:
 *              userQuestion:
 *                type: string
 *
 *     responses:
 *       200:
 *         description: Successful response with a weather summary.
 *       400:
 *         description: Bad Request
 *       500:
 *         description: Internal Server Error
 */
router.post(
  '/:id',
  celebrate({
    body: chatBodySchema,
  }),
  async (req, res) => {
    const { userQuestion } = req.body;
    const { id: conversationId } = req.params;

    console.log(
      'received conversation. ' +
        conversationId +
        ' User Question: ' +
        userQuestion,
    );
    try {
      console.log('Streaming enabled: ' + process.env.IS_STREAMING_ENABLED);
      // IS_STREAMING_ENABLED, response will be ended after assistant streaming ends
      const response = await initConversation(userQuestion, res);

      if (!process.env.IS_STREAMING_ENABLED) {
        console.log(
          'received response. ' +
            conversationId +
            ' User Question: ' +
            userQuestion +
            ' Response: ' +
            response,
        );
        res.json(response);
      }
    } catch (error) {
      console.error(error);
      handleError(res, error, 'chat api failed.');
    }
  },
);

export default router;
