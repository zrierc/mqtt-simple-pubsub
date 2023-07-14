import { Context } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import * as mqtt from 'mqtt';

const host = process.env.MQ_HOST!;
const topic = process.env.MQ_TOPIC!;

// create connection
const options: mqtt.IClientOptions = {
  username: process.env.MQ_USERNAME,
  password: process.env.MQ_PASSWORD,
  protocol: 'mqtts',
  clientId: `lambda_${uuidv4()}`,
};
const client = mqtt.connect(host, options);

export function handler(event: any, context: Context) {
  console.info('publisher function is called');
  let response: any;

  // Parse event
  const message = JSON.stringify({
    id: uuidv4(),
    time: Date.now(),
    data: event,
  });

  // Send data
  client.on('connect', () => {
    client.subscribe(topic, err => {
      if (!err) {
        client.publish(topic, message);
        client.end();

        response = {
          status: 'success',
          message: `published on ${topic}`,
        };
        console.info(response);
      }
      client.end();
    });
  });

  // Error handling
  client.on('error', err => {
    response = {
      status: err.name,
      message: err.message,
    };
    console.error(response);
    client.end();
    throw Error(err.message);
  });
}
