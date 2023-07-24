import {
  ModelInit,
  MutableModel,
  __modelMeta__,
  ManagedIdentifier,
} from '@aws-amplify/datastore';
// @ts-ignore
import {
  LazyLoading,
  LazyLoadingDisabled,
  AsyncItem,
  AsyncCollection,
} from '@aws-amplify/datastore';

export enum OrderStatus {
  INITIALIZED = 'INITIALIZED',
  INPROGRESS = 'INPROGRESS',
  SUCESSED = 'SUCESSED',
  FAILED = 'FAILED',
  ERROR = 'ERROR',
}

type EagerDiscount = {
  readonly name?: string | null;
  readonly share: string;
  readonly collectionAddress: string;
  readonly chainId: string;
};

type LazyDiscount = {
  readonly name?: string | null;
  readonly share: string;
  readonly collectionAddress: string;
  readonly chainId: string;
};

export declare type Discount = LazyLoading extends LazyLoadingDisabled
  ? EagerDiscount
  : LazyDiscount;

export declare const Discount: new (init: ModelInit<Discount>) => Discount;

type EagerAffiliate = {
  readonly name?: string | null;
  readonly chain: string;
  readonly address: string;
  readonly share: string;
};

type LazyAffiliate = {
  readonly name?: string | null;
  readonly chain: string;
  readonly address: string;
  readonly share: string;
};

export declare type Affiliate = LazyLoading extends LazyLoadingDisabled
  ? EagerAffiliate
  : LazyAffiliate;

export declare const Affiliate: new (init: ModelInit<Affiliate>) => Affiliate;

type EagerPrice = {
  readonly chain: string;
  readonly currencyMint: string;
  readonly amount: string;
};

type LazyPrice = {
  readonly chain: string;
  readonly currencyMint: string;
  readonly amount: string;
};

export declare type Price = LazyLoading extends LazyLoadingDisabled
  ? EagerPrice
  : LazyPrice;

export declare const Price: new (init: ModelInit<Price>) => Price;

type EagerLinkRestrictions = {
  readonly expiration?: number | null;
  readonly count?: number | null;
};

type LazyLinkRestrictions = {
  readonly expiration?: number | null;
  readonly count?: number | null;
};

export declare type LinkRestrictions = LazyLoading extends LazyLoadingDisabled
  ? EagerLinkRestrictions
  : LazyLinkRestrictions;

export declare const LinkRestrictions: new (
  init: ModelInit<LinkRestrictions>
) => LinkRestrictions;

type EagerWallet = {
  readonly chainId?: string[] | null;
  readonly address: string;
};

type LazyWallet = {
  readonly chainId?: string[] | null;
  readonly address: string;
};

export declare type Wallet = LazyLoading extends LazyLoadingDisabled
  ? EagerWallet
  : LazyWallet;

export declare const Wallet: new (init: ModelInit<Wallet>) => Wallet;

type EagerCurrency = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Currency, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly mintAddress: string;
  readonly decimals: string;
  readonly name: string;
  readonly chainID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

type LazyCurrency = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Currency, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly mintAddress: string;
  readonly decimals: string;
  readonly name: string;
  readonly chainID: string;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

export declare type Currency = LazyLoading extends LazyLoadingDisabled
  ? EagerCurrency
  : LazyCurrency;

export declare const Currency: (new (init: ModelInit<Currency>) => Currency) & {
  copyOf(
    source: Currency,
    mutator: (draft: MutableModel<Currency>) => MutableModel<Currency> | void
  ): Currency;
};

type EagerOrder = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Order, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly paylinkID: string;
  readonly reference: string;
  readonly status: OrderStatus | keyof typeof OrderStatus;
  readonly amountToSeller?: number | null;
  readonly amountToAffiliate?: number | null;
  readonly affiliateAddress?: number | null;
  readonly Currency?: Currency | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly orderCurrencyId?: string | null;
};

type LazyOrder = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Order, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly paylinkID: string;
  readonly reference: string;
  readonly status: OrderStatus | keyof typeof OrderStatus;
  readonly amountToSeller?: number | null;
  readonly amountToAffiliate?: number | null;
  readonly affiliateAddress?: number | null;
  readonly Currency: AsyncItem<Currency | undefined>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  readonly orderCurrencyId?: string | null;
};

export declare type Order = LazyLoading extends LazyLoadingDisabled
  ? EagerOrder
  : LazyOrder;

export declare const Order: (new (init: ModelInit<Order>) => Order) & {
  copyOf(
    source: Order,
    mutator: (draft: MutableModel<Order>) => MutableModel<Order> | void
  ): Order;
};

type EagerChain = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Chain, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly chainId?: string | null;
  readonly chainName?: string | null;
  readonly Currencies?: (Currency | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

type LazyChain = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Chain, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly chainId?: string | null;
  readonly chainName?: string | null;
  readonly Currencies: AsyncCollection<Currency>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

export declare type Chain = LazyLoading extends LazyLoadingDisabled
  ? EagerChain
  : LazyChain;

export declare const Chain: (new (init: ModelInit<Chain>) => Chain) & {
  copyOf(
    source: Chain,
    mutator: (draft: MutableModel<Chain>) => MutableModel<Chain> | void
  ): Chain;
};

type EagerPayLink = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<PayLink, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly productID: string;
  readonly name: string;
  readonly slug: string;
  readonly redirectUrl?: string | null;
  readonly thankText?: string | null;
  readonly restrictions?: LinkRestrictions | null;
  readonly prices: Price[];
  readonly affiliates?: (Affiliate | null)[] | null;
  readonly discounts?: (Discount | null)[] | null;
  readonly Orders?: (Order | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

type LazyPayLink = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<PayLink, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly productID: string;
  readonly name: string;
  readonly slug: string;
  readonly redirectUrl?: string | null;
  readonly thankText?: string | null;
  readonly restrictions?: LinkRestrictions | null;
  readonly prices: Price[];
  readonly affiliates?: (Affiliate | null)[] | null;
  readonly discounts?: (Discount | null)[] | null;
  readonly Orders: AsyncCollection<Order>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

export declare type PayLink = LazyLoading extends LazyLoadingDisabled
  ? EagerPayLink
  : LazyPayLink;

export declare const PayLink: (new (init: ModelInit<PayLink>) => PayLink) & {
  copyOf(
    source: PayLink,
    mutator: (draft: MutableModel<PayLink>) => MutableModel<PayLink> | void
  ): PayLink;
};

type EagerProduct = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Product, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly image?: string | null;
  readonly description?: string | null;
  readonly userID: string;
  readonly PayLinks?: (PayLink | null)[] | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

type LazyProduct = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Product, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly image?: string | null;
  readonly description?: string | null;
  readonly userID: string;
  readonly PayLinks: AsyncCollection<PayLink>;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

export declare type Product = LazyLoading extends LazyLoadingDisabled
  ? EagerProduct
  : LazyProduct;

export declare const Product: (new (init: ModelInit<Product>) => Product) & {
  copyOf(
    source: Product,
    mutator: (draft: MutableModel<Product>) => MutableModel<Product> | void
  ): Product;
};

type EagerMerchant = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Merchant, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly logo?: string | null;
  readonly primaryColor?: string | null;
  readonly secondaryColor?: string | null;
  readonly defaultWallet?: Wallet | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

type LazyMerchant = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<Merchant, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly logo?: string | null;
  readonly primaryColor?: string | null;
  readonly secondaryColor?: string | null;
  readonly defaultWallet?: Wallet | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

export declare type Merchant = LazyLoading extends LazyLoadingDisabled
  ? EagerMerchant
  : LazyMerchant;

export declare const Merchant: (new (init: ModelInit<Merchant>) => Merchant) & {
  copyOf(
    source: Merchant,
    mutator: (draft: MutableModel<Merchant>) => MutableModel<Merchant> | void
  ): Merchant;
};

type EagerUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly avatar?: string | null;
  readonly wallets: Wallet[];
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

type LazyUser = {
  readonly [__modelMeta__]: {
    identifier: ManagedIdentifier<User, 'id'>;
    readOnlyFields: 'createdAt' | 'updatedAt';
  };
  readonly id: string;
  readonly name?: string | null;
  readonly avatar?: string | null;
  readonly wallets: Wallet[];
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
};

export declare type User = LazyLoading extends LazyLoadingDisabled
  ? EagerUser
  : LazyUser;

export declare const User: (new (init: ModelInit<User>) => User) & {
  copyOf(
    source: User,
    mutator: (draft: MutableModel<User>) => MutableModel<User> | void
  ): User;
};
