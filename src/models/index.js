// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';



const { Photo } = initSchema(schema);

export {
  Photo
};