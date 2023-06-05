/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreatePhoto = /* GraphQL */ `
  subscription OnCreatePhoto($filter: ModelSubscriptionPhotoFilterInput) {
    onCreatePhoto(filter: $filter) {
      id
      s3key
      type
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onUpdatePhoto = /* GraphQL */ `
  subscription OnUpdatePhoto($filter: ModelSubscriptionPhotoFilterInput) {
    onUpdatePhoto(filter: $filter) {
      id
      s3key
      type
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
export const onDeletePhoto = /* GraphQL */ `
  subscription OnDeletePhoto($filter: ModelSubscriptionPhotoFilterInput) {
    onDeletePhoto(filter: $filter) {
      id
      s3key
      type
      createdAt
      updatedAt
      _version
      _deleted
      _lastChangedAt
    }
  }
`;
