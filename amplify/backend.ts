import { defineBackend } from '@aws-amplify/backend';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';
import { auth } from './auth/resource.js';
import { data } from './data/resource.js';
import { storage } from './storage/resource.js';

const backend = defineBackend({ auth, data, storage });
const bucket = backend.storage.resources.bucket;
const cfnBucket = bucket.node.defaultChild as CfnBucket;

cfnBucket.addPropertyOverride('PublicAccessBlockConfiguration.BlockPublicPolicy', false);
cfnBucket.addPropertyOverride('PublicAccessBlockConfiguration.RestrictPublicBuckets', false);

bucket.addToResourcePolicy(
  new PolicyStatement({
    sid: 'PublicReadOnPublicPrefix',
    effect: Effect.ALLOW,
    principals: [new AnyPrincipal()],
    actions: ['s3:GetObject'],
    resources: [`${bucket.bucketArn}/public/*`],
  }),
);
