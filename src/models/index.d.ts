import { ModelInit, MutableModel } from "@aws-amplify/datastore";
// @ts-ignore
import { LazyLoading, LazyLoadingDisabled } from "@aws-amplify/datastore";

type TakcarlyCoverPhotoMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type EagerTakcarlyCoverPhoto = {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

type LazyTakcarlyCoverPhoto = {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
}

export declare type TakcarlyCoverPhoto = LazyLoading extends LazyLoadingDisabled ? EagerTakcarlyCoverPhoto : LazyTakcarlyCoverPhoto

export declare const TakcarlyCoverPhoto: (new (init: ModelInit<TakcarlyCoverPhoto, TakcarlyCoverPhotoMetaData>) => TakcarlyCoverPhoto) & {
  copyOf(source: TakcarlyCoverPhoto, mutator: (draft: MutableModel<TakcarlyCoverPhoto, TakcarlyCoverPhotoMetaData>) => MutableModel<TakcarlyCoverPhoto, TakcarlyCoverPhotoMetaData> | void): TakcarlyCoverPhoto;
}