import { PubSub } from '@google-cloud/pubsub';

const pubsub = new PubSub();

interface TopicAndSubscription {
  topicName: string;
  subscriptionName: string;
}

type Topic = import('@google-cloud/pubsub').Topic;
type Subscription = import('@google-cloud/pubsub').Subscription;

export default async function createTopicAndSubscription({
  topicName,
  subscriptionName,
}: TopicAndSubscription): Promise<[Topic, Subscription]> {
  const topic = pubsub.topic(topicName);
  const [topicExists] = await topic.exists();

  if (!topicExists) {
    await topic.create();
  }

  const subscription = topic.subscription(subscriptionName);
  const [subscriptionExists] = await subscription.exists();

  if (!subscriptionExists) {
    await subscription.create();
  }

  return [topic, subscription];
}
