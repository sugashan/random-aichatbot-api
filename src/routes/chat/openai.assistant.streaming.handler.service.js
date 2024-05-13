import { EventEmitter } from 'node:events';
import terminal from 'terminal-kit';
import { getWeatherHistoryData } from '../../externalServices/weather.service.js';

const term = terminal.terminal;

class AssistantStreamingEventHandler extends EventEmitter {
  constructor(client, res) {
    super();
    this.client = client;
    this.res = res;
  }

  async onEvent(event) {
    try {
      // console.log('\nEventhandler: ' + event.event);
      // Retrieve events that are denoted with 'requires_action'
      // since these will have our tool_calls
      if (event.event === 'thread.run.requires_action') {
        await this.handleRequiresAction(
          event.data,
          event.data.id,
          event.data.thread_id,
        );
      } else if (event.event === 'thread.message.created') {
        // console.log('streaming started....! ');
        term.inverse('\nAssistant: ');
      } else if (event.event === 'thread.message.delta') {
        //console.log('streaming....! ');
        //console.log(JSON.stringify(event.data));
        term.inverse(event.data.delta.content[0].text.value);

        this.res.write(event.data.delta.content[0].text.value);
      } else if (event.event === 'thread.message.completed') {
        //console.log('Gotcha!! streaming ended! ');
        term.inverse('\n Ended. Any other question?');

        this.res.end();
      } else if (event.event === 'error') {
        console.error('Error handling event:', event.data);
        this.res.end();
      }
    } catch (error) {
      console.error('Error handling event:', error);
    }
  }

  async handleRequiresAction(data, runId, threadId) {
    let arugments = null;
    try {
      const toolOutputs = await Promise.all(
        data.required_action.submit_tool_outputs.tool_calls.map(
          async (tool) => {
            if (tool.function.name === 'getWeatherHistoryData') {
              arugments = JSON.parse(tool.function.arguments);
              var output = null;

              try {
                const weatherDataResponse = await getWeatherHistoryData(
                  arugments['location'],
                );
                console.log('API Response: ' + weatherDataResponse.status);
                output = JSON.stringify(weatherDataResponse.data);
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
          },
        ),
      );
      // Submit all the tool outputs at the same time
      await this.submitToolOutputs(toolOutputs, runId, threadId);
    } catch (error) {
      console.error('Error processing required action:', error);
    }
  }

  async submitToolOutputs(toolOutputs, runId, threadId) {
    try {
      // Use the submitToolOutputsStream helper
      const stream = this.client.beta.threads.runs.submitToolOutputsStream(
        threadId,
        runId,
        { tool_outputs: toolOutputs },
      );
      for await (const event of stream) {
        this.emit('event', event);
      }
    } catch (error) {
      console.error('Error submitting tool outputs:', error);
    }
  }
}

export default AssistantStreamingEventHandler;
