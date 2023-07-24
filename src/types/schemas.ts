import { object, string, number, date, InferType, mixed, array } from 'yup';
import {
  AllowedChains,
  MaximumProductDescriptionLength,
  MaximumProductNameLenght,
  MinProductNameLength,
} from '@/utils/PlatformSettings';
import { PublicKey } from '@solana/web3.js';

const productName = string().test({
  name: 'length',
  exclusive: true,
  params: { MinProductNameLength, MaximumProductNameLenght },
  message:
    '${path} must be less than ${MaximumProductNameLenght} characters and more than ${MinProductNameLength}',
  test: (value) =>
    value == null ||
    value.length <= MaximumProductNameLenght ||
    value.length >= MinProductNameLength,
});

const productDescription = string()
  .notRequired()
  .test({
    name: 'length',
    exclusive: true,
    params: { MaximumProductDescriptionLength },
    message: '${path} must be less than ${MaximumProductNameLenght} characters',
    test: (value) =>
      value == null || value.length <= MaximumProductDescriptionLength,
  });
const isCorrectChain = mixed().oneOf(AllowedChains).defined();
const isSolanaPubKey = string().test({
  test(value, ctx) {
    try {
      new PublicKey(value);
      return true;
    } catch (e) {
      return ctx.createError({ message: 'Incorrect public key' });
    }
  },
});

export const createProduct = object({
  name: productName,
  description: productDescription,
  image: string().url().notRequired(),
});

export const createWebhook = object({
  name: productName.required(),
  url: string().url().required(),
});

export const userUpdate = object().shape({
  name: string().min(2, 'Too Short!').max(50, 'Too Long!').notRequired(),
  logo: string().url('Invalid image').notRequired(),
});

export const createPaymentLink = object({
  productId: string().required(),
  slug: string().url(),
  prices: array().of(
    object({
      amount: number(),
      mint: isSolanaPubKey,
      chain: isCorrectChain,
      recipient: isSolanaPubKey,
    })
  ),
});
