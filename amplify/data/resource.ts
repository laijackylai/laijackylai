import { defineData } from '@aws-amplify/backend';
import type { Backend } from '../backend';
import { aws_iam } from 'aws-cdk-lib';

const schema = `type Photo @model @auth(rules: [{allow: public}]) {
  id: ID!
  s3key: String!
  type: String!
  aspectRatio: String
  blurredBase64: String
}
 `;

export const data = defineData({
  migratedAmplifyGen1DynamoDbTableMappings: [
    {
      //The "branchName" variable needs to be the same as your deployment branch if you want to reuse your Gen1 app tables
      branchName: 'main',
      modelNameToTableNameMapping: {
        Photo: 'Photo-gbzpma2elvdxnjqehhqdnf5wmy-main',
      },
    },
  ],
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
      description: 'api key description',
    },
  },
  schema,
});

export function applyEscapeHatches(backend: Backend) {
  const cfnGraphqlApi = backend.data.resources.cfnResources.cfnGraphqlApi;
  cfnGraphqlApi.additionalAuthenticationProviders = [
    {
      authenticationType: 'AWS_IAM',
    },
  ];
  backend.auth.resources.authenticatedUserIamRole.addToPrincipalPolicy(
    new aws_iam.PolicyStatement({
      effect: aws_iam.Effect.ALLOW,
      actions: ['appsync:GraphQL'],
      resources: [
        `arn:aws:appsync:${backend.data.stack.region}:${backend.data.stack.account}:apis/gbzpma2elvdxnjqehhqdnf5wmy/*`,
      ],
    })
  );
}
