import * as data from './data/resource';
import * as auth from './auth/resource';
import * as storage from './storage/resource';
import { defineBackend } from '@aws-amplify/backend';
import { Tags } from 'aws-cdk-lib';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { CfnBucket } from 'aws-cdk-lib/aws-s3';

const backend = defineBackend({
  data: data.data,
  auth: auth.auth,
  storage: storage.storage,
});

export type Backend = typeof backend;

data.applyEscapeHatches(backend);
auth.applyEscapeHatches(backend);
storage.applyEscapeHatches(backend);

const bucket = backend.storage.resources.bucket;
const cfnBucket = bucket.node.defaultChild as CfnBucket;

cfnBucket.addPropertyOverride('PublicAccessBlockConfiguration.BlockPublicAcls', true);
cfnBucket.addPropertyOverride('PublicAccessBlockConfiguration.IgnorePublicAcls', true);
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

export function postRefactor() {
  storage.postRefactor(backend);
  Tags.of(backend.stack).add('gen2-migration/post-refactor', 'true');
}

// Uncomment after refactor
// postRefactor();
