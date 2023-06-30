/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type CreatePhotoInput = {
  id?: string | null,
  s3key: string,
  type: string,
  aspectRatio?: string | null,
  blurredBase64?: string | null,
  _version?: number | null,
};

export type ModelPhotoConditionInput = {
  s3key?: ModelStringInput | null,
  type?: ModelStringInput | null,
  aspectRatio?: ModelStringInput | null,
  blurredBase64?: ModelStringInput | null,
  and?: Array< ModelPhotoConditionInput | null > | null,
  or?: Array< ModelPhotoConditionInput | null > | null,
  not?: ModelPhotoConditionInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export enum ModelAttributeTypes {
  binary = "binary",
  binarySet = "binarySet",
  bool = "bool",
  list = "list",
  map = "map",
  number = "number",
  numberSet = "numberSet",
  string = "string",
  stringSet = "stringSet",
  _null = "_null",
}


export type ModelSizeInput = {
  ne?: number | null,
  eq?: number | null,
  le?: number | null,
  lt?: number | null,
  ge?: number | null,
  gt?: number | null,
  between?: Array< number | null > | null,
};

export type ModelBooleanInput = {
  ne?: boolean | null,
  eq?: boolean | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
};

export type Photo = {
  __typename: "Photo",
  id: string,
  s3key: string,
  type: string,
  aspectRatio?: string | null,
  blurredBase64?: string | null,
  createdAt: string,
  updatedAt: string,
  _version: number,
  _deleted?: boolean | null,
  _lastChangedAt: number,
};

export type UpdatePhotoInput = {
  id: string,
  s3key?: string | null,
  type?: string | null,
  aspectRatio?: string | null,
  blurredBase64?: string | null,
  _version?: number | null,
};

export type DeletePhotoInput = {
  id: string,
  _version?: number | null,
};

export type ModelPhotoFilterInput = {
  id?: ModelIDInput | null,
  s3key?: ModelStringInput | null,
  type?: ModelStringInput | null,
  aspectRatio?: ModelStringInput | null,
  blurredBase64?: ModelStringInput | null,
  and?: Array< ModelPhotoFilterInput | null > | null,
  or?: Array< ModelPhotoFilterInput | null > | null,
  not?: ModelPhotoFilterInput | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  attributeExists?: boolean | null,
  attributeType?: ModelAttributeTypes | null,
  size?: ModelSizeInput | null,
};

export type ModelPhotoConnection = {
  __typename: "ModelPhotoConnection",
  items:  Array<Photo | null >,
  nextToken?: string | null,
  startedAt?: number | null,
};

export type ModelSubscriptionPhotoFilterInput = {
  id?: ModelSubscriptionIDInput | null,
  s3key?: ModelSubscriptionStringInput | null,
  type?: ModelSubscriptionStringInput | null,
  aspectRatio?: ModelSubscriptionStringInput | null,
  blurredBase64?: ModelSubscriptionStringInput | null,
  and?: Array< ModelSubscriptionPhotoFilterInput | null > | null,
  or?: Array< ModelSubscriptionPhotoFilterInput | null > | null,
  _deleted?: ModelBooleanInput | null,
};

export type ModelSubscriptionIDInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type ModelSubscriptionStringInput = {
  ne?: string | null,
  eq?: string | null,
  le?: string | null,
  lt?: string | null,
  ge?: string | null,
  gt?: string | null,
  contains?: string | null,
  notContains?: string | null,
  between?: Array< string | null > | null,
  beginsWith?: string | null,
  in?: Array< string | null > | null,
  notIn?: Array< string | null > | null,
};

export type CreatePhotoMutationVariables = {
  input: CreatePhotoInput,
  condition?: ModelPhotoConditionInput | null,
};

export type CreatePhotoMutation = {
  createPhoto?:  {
    __typename: "Photo",
    id: string,
    s3key: string,
    type: string,
    aspectRatio?: string | null,
    blurredBase64?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type UpdatePhotoMutationVariables = {
  input: UpdatePhotoInput,
  condition?: ModelPhotoConditionInput | null,
};

export type UpdatePhotoMutation = {
  updatePhoto?:  {
    __typename: "Photo",
    id: string,
    s3key: string,
    type: string,
    aspectRatio?: string | null,
    blurredBase64?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type DeletePhotoMutationVariables = {
  input: DeletePhotoInput,
  condition?: ModelPhotoConditionInput | null,
};

export type DeletePhotoMutation = {
  deletePhoto?:  {
    __typename: "Photo",
    id: string,
    s3key: string,
    type: string,
    aspectRatio?: string | null,
    blurredBase64?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type GetPhotoQueryVariables = {
  id: string,
};

export type GetPhotoQuery = {
  getPhoto?:  {
    __typename: "Photo",
    id: string,
    s3key: string,
    type: string,
    aspectRatio?: string | null,
    blurredBase64?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type ListPhotosQueryVariables = {
  filter?: ModelPhotoFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
};

export type ListPhotosQuery = {
  listPhotos?:  {
    __typename: "ModelPhotoConnection",
    items:  Array< {
      __typename: "Photo",
      id: string,
      s3key: string,
      type: string,
      aspectRatio?: string | null,
      blurredBase64?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type SyncPhotosQueryVariables = {
  filter?: ModelPhotoFilterInput | null,
  limit?: number | null,
  nextToken?: string | null,
  lastSync?: number | null,
};

export type SyncPhotosQuery = {
  syncPhotos?:  {
    __typename: "ModelPhotoConnection",
    items:  Array< {
      __typename: "Photo",
      id: string,
      s3key: string,
      type: string,
      aspectRatio?: string | null,
      blurredBase64?: string | null,
      createdAt: string,
      updatedAt: string,
      _version: number,
      _deleted?: boolean | null,
      _lastChangedAt: number,
    } | null >,
    nextToken?: string | null,
    startedAt?: number | null,
  } | null,
};

export type OnCreatePhotoSubscriptionVariables = {
  filter?: ModelSubscriptionPhotoFilterInput | null,
};

export type OnCreatePhotoSubscription = {
  onCreatePhoto?:  {
    __typename: "Photo",
    id: string,
    s3key: string,
    type: string,
    aspectRatio?: string | null,
    blurredBase64?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnUpdatePhotoSubscriptionVariables = {
  filter?: ModelSubscriptionPhotoFilterInput | null,
};

export type OnUpdatePhotoSubscription = {
  onUpdatePhoto?:  {
    __typename: "Photo",
    id: string,
    s3key: string,
    type: string,
    aspectRatio?: string | null,
    blurredBase64?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};

export type OnDeletePhotoSubscriptionVariables = {
  filter?: ModelSubscriptionPhotoFilterInput | null,
};

export type OnDeletePhotoSubscription = {
  onDeletePhoto?:  {
    __typename: "Photo",
    id: string,
    s3key: string,
    type: string,
    aspectRatio?: string | null,
    blurredBase64?: string | null,
    createdAt: string,
    updatedAt: string,
    _version: number,
    _deleted?: boolean | null,
    _lastChangedAt: number,
  } | null,
};
