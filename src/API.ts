/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Channel = {
  __typename: 'Channel';
  data: string;
  name: string;
};

export type PublishMutationVariables = {
  data: string;
  name: string;
};

export type PublishMutation = {
  publish?: {
    __typename: 'Channel';
    data: string;
    name: string;
  } | null;
};

export type GetChannelQuery = {
  getChannel?: {
    __typename: 'Channel';
    data: string;
    name: string;
  } | null;
};

export type SubscribeSubscriptionVariables = {
  name: string;
};

export type SubscribeSubscription = {
  subscribe?: {
    __typename: 'Channel';
    data: string;
    name: string;
  } | null;
};
