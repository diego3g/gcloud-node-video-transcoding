import { PubSub } from '@google-cloud/pubsub';
import transcode from './services/transcode';

const pubsub = new PubSub();

(async (): Promise<void> => {
  const workerSubscription = pubsub
    .topic('jupiter-worker')
    .subscription('transcode-worker');

  type Message = import('@google-cloud/pubsub').Message;

  workerSubscription.on('message', async (message: Message) => {
    const { file, resolution } = JSON.parse(message.data.toString());

    console.log(`✉️ [Worker] Message: [${resolution.suffix}] ${file.name}`);

    transcode(file, resolution);

    message.ack();
  });

  console.log('⚡️ [Worker] Listening to messages');
})();
