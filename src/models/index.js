// @ts-check
import { initSchema } from '@aws-amplify/datastore';
import { schema } from './schema';

const OrderStatus = {
  INITIALIZED: 'INITIALIZED',
  INPROGRESS: 'INPROGRESS',
  SUCESSED: 'SUCESSED',
  FAILED: 'FAILED',
  ERROR: 'ERROR',
};

const {
  Currency,
  Order,
  Chain,
  PayLink,
  Product,
  Merchant,
  User,
  Discount,
  Affiliate,
  Price,
  LinkRestrictions,
  Wallet,
} = initSchema(schema);

export {
  Currency,
  Order,
  Chain,
  PayLink,
  Product,
  Merchant,
  User,
  OrderStatus,
  Discount,
  Affiliate,
  Price,
  LinkRestrictions,
  Wallet,
};
