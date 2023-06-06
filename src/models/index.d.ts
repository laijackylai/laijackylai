import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";

type PhotoMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type EagerPhoto = {
  readonly id: string;
  readonly s3key: string;
  readonly type: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyPhoto = {
  readonly id: string;
  readonly s3key: string;
  readonly type: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type Photo = LazyLoading extends LazyLoadingDisabled ? EagerPhoto : LazyPhoto

export declare const Photo: (new (init: ModelInit<Photo, PhotoMetaData>) => Photo) & {
  copyOf(source: Photo, mutator: (draft: MutableModel<Photo, PhotoMetaData>) => MutableModel<Photo, PhotoMetaData> | void): Photo;
}