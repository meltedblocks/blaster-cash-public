import { API, graphqlOperation } from '@aws-amplify/api';
const publish = /* GraphQL */ `
  mutation Publish($data: AWSJSON!, $name: String!) {
    publish(data: $data, name: $name) {
      data
      name
    }
  }
`;

export default async (msg, orderId) => {
  // send message to frontend
  API.configure({
    aws_appsync_graphqlEndpoint: process.env.GRAPHQL_ENDPOINT,
    aws_appsync_region: process.env.REGION,
    aws_appsync_authenticationType: 'API_KEY',
    aws_appsync_apiKey: process.env.GRAPHQL_API_KEY,
  });
  let msgParsed = JSON.stringify({
    msg,
  });
  await API.graphql(
    graphqlOperation(publish, {
      data: msgParsed,
      name: orderId,
    })
  );
};
