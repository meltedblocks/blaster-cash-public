export const schema = {
  models: {
    Currency: {
      name: 'Currency',
      fields: {
        id: {
          name: 'id',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: [],
        },
        mintAddress: {
          name: 'mintAddress',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
        decimals: {
          name: 'decimals',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
        name: {
          name: 'name',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
        chainID: {
          name: 'chainID',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: [],
        },
        createdAt: {
          name: 'createdAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
        updatedAt: {
          name: 'updatedAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
      },
      syncable: true,
      pluralName: 'Currencies',
      attributes: [
        {
          type: 'model',
          properties: {},
        },
        {
          type: 'key',
          properties: {
            name: 'byChain',
            fields: ['chainID'],
          },
        },
        {
          type: 'auth',
          properties: {
            rules: [
              {
                allow: 'public',
                operations: ['create', 'update', 'delete', 'read'],
              },
            ],
          },
        },
      ],
    },
    Order: {
      name: 'Order',
      fields: {
        id: {
          name: 'id',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: [],
        },
        paylinkID: {
          name: 'paylinkID',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: [],
        },
        reference: {
          name: 'reference',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
        status: {
          name: 'status',
          isArray: false,
          type: {
            enum: 'OrderStatus',
          },
          isRequired: true,
          attributes: [],
        },
        amountToSeller: {
          name: 'amountToSeller',
          isArray: false,
          type: 'Int',
          isRequired: false,
          attributes: [],
        },
        amountToAffiliate: {
          name: 'amountToAffiliate',
          isArray: false,
          type: 'Int',
          isRequired: false,
          attributes: [],
        },
        affiliateAddress: {
          name: 'affiliateAddress',
          isArray: false,
          type: 'Int',
          isRequired: false,
          attributes: [],
        },
        Currency: {
          name: 'Currency',
          isArray: false,
          type: {
            model: 'Currency',
          },
          isRequired: false,
          attributes: [],
          association: {
            connectionType: 'HAS_ONE',
            associatedWith: ['id'],
            targetNames: ['orderCurrencyId'],
          },
        },
        createdAt: {
          name: 'createdAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
        updatedAt: {
          name: 'updatedAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
        orderCurrencyId: {
          name: 'orderCurrencyId',
          isArray: false,
          type: 'ID',
          isRequired: false,
          attributes: [],
        },
      },
      syncable: true,
      pluralName: 'Orders',
      attributes: [
        {
          type: 'model',
          properties: {},
        },
        {
          type: 'key',
          properties: {
            name: 'byPayLink',
            fields: ['paylinkID'],
          },
        },
        {
          type: 'auth',
          properties: {
            rules: [
              {
                allow: 'public',
                operations: ['create', 'update', 'delete', 'read'],
              },
              {
                allow: 'public',
                operations: ['read'],
                provider: 'iam',
              },
            ],
          },
        },
      ],
    },
    Chain: {
      name: 'Chain',
      fields: {
        id: {
          name: 'id',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: [],
        },
        chainId: {
          name: 'chainId',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: [],
        },
        chainName: {
          name: 'chainName',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: [],
        },
        Currencies: {
          name: 'Currencies',
          isArray: true,
          type: {
            model: 'Currency',
          },
          isRequired: false,
          attributes: [],
          isArrayNullable: true,
          association: {
            connectionType: 'HAS_MANY',
            associatedWith: ['chainID'],
          },
        },
        createdAt: {
          name: 'createdAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
        updatedAt: {
          name: 'updatedAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
      },
      syncable: true,
      pluralName: 'Chains',
      attributes: [
        {
          type: 'model',
          properties: {},
        },
        {
          type: 'auth',
          properties: {
            rules: [
              {
                allow: 'public',
                operations: ['create', 'update', 'delete', 'read'],
              },
            ],
          },
        },
      ],
    },
    PayLink: {
      name: 'PayLink',
      fields: {
        id: {
          name: 'id',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: [],
        },
        productID: {
          name: 'productID',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: [],
        },
        name: {
          name: 'name',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
        slug: {
          name: 'slug',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
        redirectUrl: {
          name: 'redirectUrl',
          isArray: false,
          type: 'AWSURL',
          isRequired: false,
          attributes: [],
        },
        thankText: {
          name: 'thankText',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: [],
        },
        restrictions: {
          name: 'restrictions',
          isArray: false,
          type: {
            nonModel: 'LinkRestrictions',
          },
          isRequired: false,
          attributes: [],
        },
        prices: {
          name: 'prices',
          isArray: true,
          type: {
            nonModel: 'Price',
          },
          isRequired: true,
          attributes: [],
          isArrayNullable: false,
        },
        affiliates: {
          name: 'affiliates',
          isArray: true,
          type: {
            nonModel: 'Affiliate',
          },
          isRequired: false,
          attributes: [],
          isArrayNullable: true,
        },
        discounts: {
          name: 'discounts',
          isArray: true,
          type: {
            nonModel: 'Discount',
          },
          isRequired: false,
          attributes: [],
          isArrayNullable: true,
        },
        Orders: {
          name: 'Orders',
          isArray: true,
          type: {
            model: 'Order',
          },
          isRequired: false,
          attributes: [],
          isArrayNullable: true,
          association: {
            connectionType: 'HAS_MANY',
            associatedWith: ['paylinkID'],
          },
        },
        createdAt: {
          name: 'createdAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
        updatedAt: {
          name: 'updatedAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
      },
      syncable: true,
      pluralName: 'PayLinks',
      attributes: [
        {
          type: 'model',
          properties: {},
        },
        {
          type: 'key',
          properties: {
            name: 'byProduct',
            fields: ['productID'],
          },
        },
        {
          type: 'auth',
          properties: {
            rules: [
              {
                allow: 'public',
                operations: ['create', 'update', 'delete', 'read'],
              },
              {
                provider: 'userPools',
                ownerField: 'owner',
                allow: 'owner',
                identityClaim: 'cognito:username',
                operations: ['create', 'update', 'delete', 'read'],
              },
            ],
          },
        },
      ],
    },
    Product: {
      name: 'Product',
      fields: {
        id: {
          name: 'id',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: [],
        },
        image: {
          name: 'image',
          isArray: false,
          type: 'AWSURL',
          isRequired: false,
          attributes: [],
        },
        description: {
          name: 'description',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: [],
        },
        userID: {
          name: 'userID',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: [],
        },
        PayLinks: {
          name: 'PayLinks',
          isArray: true,
          type: {
            model: 'PayLink',
          },
          isRequired: false,
          attributes: [],
          isArrayNullable: true,
          association: {
            connectionType: 'HAS_MANY',
            associatedWith: ['productID'],
          },
        },
        createdAt: {
          name: 'createdAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
        updatedAt: {
          name: 'updatedAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
      },
      syncable: true,
      pluralName: 'Products',
      attributes: [
        {
          type: 'model',
          properties: {},
        },
        {
          type: 'key',
          properties: {
            name: 'byUser',
            fields: ['userID'],
          },
        },
        {
          type: 'auth',
          properties: {
            rules: [
              {
                provider: 'userPools',
                ownerField: 'owner',
                allow: 'owner',
                identityClaim: 'cognito:username',
                operations: ['create', 'update', 'delete', 'read'],
              },
              {
                allow: 'public',
                operations: ['create', 'update', 'delete', 'read'],
              },
              {
                allow: 'private',
                operations: ['create', 'update', 'delete', 'read'],
              },
            ],
          },
        },
      ],
    },
    Merchant: {
      name: 'Merchant',
      fields: {
        id: {
          name: 'id',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: [],
        },
        name: {
          name: 'name',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: [],
        },
        logo: {
          name: 'logo',
          isArray: false,
          type: 'AWSURL',
          isRequired: false,
          attributes: [],
        },
        primaryColor: {
          name: 'primaryColor',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: [],
        },
        secondaryColor: {
          name: 'secondaryColor',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: [],
        },
        defaultWallet: {
          name: 'defaultWallet',
          isArray: false,
          type: {
            nonModel: 'Wallet',
          },
          isRequired: false,
          attributes: [],
        },
        createdAt: {
          name: 'createdAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
        updatedAt: {
          name: 'updatedAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
      },
      syncable: true,
      pluralName: 'Merchants',
      attributes: [
        {
          type: 'model',
          properties: {},
        },
        {
          type: 'auth',
          properties: {
            rules: [
              {
                allow: 'public',
                operations: ['create', 'update', 'delete', 'read'],
              },
              {
                provider: 'userPools',
                ownerField: 'owner',
                allow: 'owner',
                identityClaim: 'cognito:username',
                operations: ['create', 'update', 'delete', 'read'],
              },
              {
                allow: 'private',
                operations: ['create', 'update', 'delete', 'read'],
              },
            ],
          },
        },
      ],
    },
    User: {
      name: 'User',
      fields: {
        id: {
          name: 'id',
          isArray: false,
          type: 'ID',
          isRequired: true,
          attributes: [],
        },
        name: {
          name: 'name',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: [],
        },
        avatar: {
          name: 'avatar',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: [],
        },
        wallets: {
          name: 'wallets',
          isArray: true,
          type: {
            nonModel: 'Wallet',
          },
          isRequired: true,
          attributes: [],
          isArrayNullable: false,
        },
        createdAt: {
          name: 'createdAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
        updatedAt: {
          name: 'updatedAt',
          isArray: false,
          type: 'AWSDateTime',
          isRequired: false,
          attributes: [],
          isReadOnly: true,
        },
      },
      syncable: true,
      pluralName: 'Users',
      attributes: [
        {
          type: 'model',
          properties: {},
        },
        {
          type: 'auth',
          properties: {
            rules: [
              {
                provider: 'userPools',
                ownerField: 'owner',
                allow: 'owner',
                identityClaim: 'cognito:username',
                operations: ['create', 'update', 'delete', 'read'],
              },
              {
                allow: 'public',
                operations: ['create', 'update', 'delete', 'read'],
              },
              {
                allow: 'private',
                operations: ['create', 'update', 'delete', 'read'],
              },
            ],
          },
        },
      ],
    },
  },
  enums: {
    OrderStatus: {
      name: 'OrderStatus',
      values: ['INITIALIZED', 'INPROGRESS', 'SUCESSED', 'FAILED', 'ERROR'],
    },
  },
  nonModels: {
    Discount: {
      name: 'Discount',
      fields: {
        name: {
          name: 'name',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: [],
        },
        share: {
          name: 'share',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
        collectionAddress: {
          name: 'collectionAddress',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
        chainId: {
          name: 'chainId',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
      },
    },
    Affiliate: {
      name: 'Affiliate',
      fields: {
        name: {
          name: 'name',
          isArray: false,
          type: 'String',
          isRequired: false,
          attributes: [],
        },
        chain: {
          name: 'chain',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
        address: {
          name: 'address',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
        share: {
          name: 'share',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
      },
    },
    Price: {
      name: 'Price',
      fields: {
        chain: {
          name: 'chain',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
        currencyMint: {
          name: 'currencyMint',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
        amount: {
          name: 'amount',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
      },
    },
    LinkRestrictions: {
      name: 'LinkRestrictions',
      fields: {
        expiration: {
          name: 'expiration',
          isArray: false,
          type: 'AWSTimestamp',
          isRequired: false,
          attributes: [],
        },
        count: {
          name: 'count',
          isArray: false,
          type: 'Int',
          isRequired: false,
          attributes: [],
        },
      },
    },
    Wallet: {
      name: 'Wallet',
      fields: {
        chainId: {
          name: 'chainId',
          isArray: true,
          type: 'String',
          isRequired: true,
          attributes: [],
          isArrayNullable: true,
        },
        address: {
          name: 'address',
          isArray: false,
          type: 'String',
          isRequired: true,
          attributes: [],
        },
      },
    },
  },
  codegenVersion: '3.3.6',
  version: 'ba12fcb38f684518fba84eee23c7f74a',
};
