import OpenAI from 'openai';
import { getWeatherHistoryData } from '../../externalServices/weather.service.js';
import AssistantStreamingEventHandler from './openai.assistant.streaming.handler.service.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // organization: process.env.ORGANIZATION,
});

// handle require action
const handleRequiresAction = async (run, threadId) => {
  // Check if there are tools that require outputs
  if (
    run.required_action &&
    run.required_action.submit_tool_outputs &&
    run.required_action.submit_tool_outputs.tool_calls
  ) {
    let arugments = null;
    // Loop through each tool in the required action section
    const toolOutputs = await Promise.all(
      run.required_action.submit_tool_outputs.tool_calls.map(async (tool) => {
        if (tool.function.name === 'getWeatherHistoryData') {
          console.log(
            '++++++++++CALLING FUNCTION: getWeatherHistoryData +++++++++++++',
          );
          arugments = JSON.parse(tool.function.arguments);
          console.log(arugments);
          var output = null;

          try {
            const weatherDataResponse = await getWeatherHistoryData(
              arugments['location'],
            );
            output = weatherDataResponse.data.days;
          } catch (error) {
            console.log(error);
            output =
              'No data found for the location from the API call: ' +
              arugments['location'];
          }

          return {
            tool_call_id: tool.id,
            output: output,
          };
        }
      }),
    );

    // Submit all tool outputs at once after collecting them in a list
    if (toolOutputs.length > 0) {
      console.log('++++++++++SUBMITTING RESPONSE+++++++++++++');
      console.log(toolOutputs);
      run = await openai.beta.threads.runs.submitToolOutputsAndPoll(
        threadId,
        run.id,
        { tool_outputs: toolOutputs },
      );
      console.log('Tool outputs submitted successfully.');
    } else {
      console.log('No tool outputs to submit.');
    }

    // Check status after submitting tool outputs
    return handleRunStatus(run, threadId);
  }
};

// handle run status
const handleRunStatus = async (run, threadId) => {
  // Check if the run is completed
  console.log(run?.status);
  if (run.status === 'completed') {
    let messages = await openai.beta.threads.messages.list(threadId);
    console.log(messages.data);
    return messages.data;
  } else if (run.status === 'requires_action') {
    return await handleRequiresAction(run, threadId);
  } else {
    console.error('Run did not complete:', run);
  }
};

// create new assistant
const createAssistant = async () => {
  const assistant = await openai.beta.assistants.create({
    model: 'gpt-4-turbo',
    instructions:
      'You are weather summary bot. Use the provided function to answer questions.',
    tools: [
      {
        type: 'function',
        function: {
          name: 'getWeatherHistoryData',
          description: 'Get the 14 day weather data for a specific location',
          parameters: {
            type: 'object',
            properties: {
              location: {
                type: 'string',
                description: 'The city and state, e.g., San Francisco, CA',
              },
            },
            required: ['location', 'todayDate', 'startDate'],
          },
        },
      },
    ],
  });
  console.log(assistant);
  return assistant.id;
};

// Init conversation with assistant
const initConversation = async (userQuestion, res) => {
  var assistantId = process.env.OPENAI_ASSISTANT_ID;

  // Create assistant
  if (assistantId == null || assistantId == '') {
    assistantId = await createAssistant();
  }

  // Create Thread
  const thread = await openai.beta.threads.create();
  const threadId = thread.id;

  // Create message to Thread
  const message = openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: userQuestion,
  });
  console.log('Created thread ID: ' + threadId + ' Message: ' + message);

  if (process.env.IS_STREAMING_ENABLED) {
    const eventHandler = new AssistantStreamingEventHandler(openai, res);
    eventHandler.on('event', eventHandler.onEvent.bind(eventHandler));

    const stream = await openai.beta.threads.runs.stream(
      threadId,
      {
        assistant_id: assistantId,
        instructions: 'response_format of type should be json_object',
      },
      eventHandler,
    );

    for await (const event of stream) {
      eventHandler.emit('event', event);
    }
  } else {
    // Create and poll run without streaming.
    let run = await openai.beta.threads.runs.createAndPoll(threadId, {
      assistant_id: assistantId,
      instructions: 'response_format of type should be json_object',
    });
    return await handleRunStatus(run, threadId);
  }
};

export default initConversation;
