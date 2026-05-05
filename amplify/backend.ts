import { defineBackend } from '@aws-amplify/backend';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';

const backend = defineBackend({ auth, data, storage });

backend.storage.resources.bucket.addToResourcePolicy(
  new PolicyStatement({
    sid: 'PublicReadOnPublicPrefix',
    effect: Effect.ALLOW,
    principals: [new AnyPrincipal()],
    actions: ['s3:GetObject'],
    resources: [`${backend.storage.resources.bucket.bucketArn}/public/*`],
  }),
);
