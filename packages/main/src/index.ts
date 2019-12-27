import createTopicAndSubscription from './utils/createTopicAndSubscription';

(async (): Promise<void> => {
  const [, storageSubscription] = await createTopicAndSubscription({
    topicName: 'jupiter',
    subscriptionName: 'transcode',
  });

  const [workerTopic] = await createTopicAndSubscription({
    topicName: 'jupiter-worker',
    subscriptionName: 'transcode-worker',
  });

  const resolutions = [
    { suffix: '1080', size: '1920x1080' },
    { suffix: '720', size: '1280x720' },
    { suffix: '360', size: '620x360' },
  ];

  type Message = import('@google-cloud/pubsub').Message;

  storageSubscription.on('message', async (message: Message) => {
    const file = JSON.parse(message.data.toString());

    console.log('✉️ [Storage] Message:', file.name);

    if (file.name.endsWith('.mp4')) {
      await Promise.all(
        resolutions.map(resolution =>
          workerTopic.publishJSON({
            file,
            resolution,
          })
        )
      );
    }

    message.ack();
  });

  console.log('📦 [Storage] Listening to messages');
})();
