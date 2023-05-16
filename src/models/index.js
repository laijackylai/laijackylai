// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { TakcarlyCoverPhoto } = initSchema(schema);

export {
  TakcarlyCoverPhoto
};