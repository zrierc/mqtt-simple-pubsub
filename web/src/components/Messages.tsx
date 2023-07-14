import { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import mqtt from 'precompiled-mqtt';
import './Messages.css';

interface IMessages {
  id: string;
  time: number;
  data: {
    temperature: number;
    humidity: number;
  };
}

const currentDate = (date: number, toTime?: boolean): string => {
  const now = new Date(date);

  return toTime ? now.toLocaleTimeString() : now.toLocaleDateString('id-ID');
};

function Messages() {
  const [payload, setPayload] = useState<IMessages[]>([]);

  // Get Data
  useEffect(() => {
    const host = import.meta.env.VITE_MQ_HOST;
    const client = mqtt.connect(host, {
      username: import.meta.env.VITE_MQ_USERNAME,
      password: import.meta.env.VITE_MQ_PASSWORD,
      protocol: 'wss',
      port: 61619,
    });
    const topicToSubscribe = import.meta.env.VITE_MQ_TOPIC;

    client.on('connect', () => {
      console.log('connected');
      client.subscribe(topicToSubscribe);
    });

    client.on('message', (_topic, message) => {
      const itemMessage = JSON.parse(message.toString());
      console.log('itemMessage: ', itemMessage);

      // make use of alternate syntax of setState to ensure you are always using
      // newest state values.
      setPayload(currentData => {
        // Create an array with a new reference.
        // Without a new reference react assumes there is no change to the array.
        const array = [...currentData];

        if (currentData.length === 0) {
          array.push(itemMessage);
        } else {
          let found = 0;
          for (let i = 0; i < currentData.length; i++) {
            console.log(currentData[i]['id'], itemMessage['id']);
            if (currentData[i]['id'] === itemMessage['id']) {
              found++;
              currentData[i] = itemMessage;
            }
          }

          if (found === 0) {
            array.push(itemMessage);
          }
        }

        return array;
      });
    });

    //Ensure client is closed on unmount of component.
    return () => {
      client.end();
    };
  }, []);

  // console.log('hi, my data:', payload);

  return (
    <Table striped borderless hover responsive variant="dark">
      <thead>
        <tr>
          <th>Sensor ID</th>
          <th>Date</th>
          <th>Time</th>
          <th>Temperature (°C)</th>
          <th>Humidity (%)</th>
        </tr>
      </thead>
      <tbody>
        {payload.map(d => (
          <tr key={d.id}>
            <td>{d.id}</td>
            <td>{currentDate(d.time)}</td>
            <td>{currentDate(d.time, true)}</td>
            <td>{d.data.temperature}</td>
            <td>{d.data.humidity}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default Messages;
