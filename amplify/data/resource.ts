import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { iamAuthenticated } from './iam-auth.js';

const schema = a.schema({
  Photo: a
    .model({
      s3key: a.string().required(),
      type: a.string().required(),
      aspectRatio: a.string().required(),
      blurredBase64: a.string(),
    })
    .authorization((allow) => [
      allow.publicApiKey().to(['read']),
      iamAuthenticated(allow).to(['create', 'update', 'delete']),
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 365 },
  },
});
