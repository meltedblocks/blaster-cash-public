# Blaster Web App

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

## Testing

Blaster is currently working on Solana Devnet. Use test application:

1. Get Solana wallet (Phantom or Solflare).
2. [Change wallet network to Devnet](https://docs.realms.today/phantom-wallet).
3. You can receive free SOL under this [link](https://solfaucet.com/).
4. Prepare three accounts/addresses:
   1. seller
   2. affiliate
   3. buyer
5. Optionally, if you’d like to test NFT discounts, you need a NFT from any NFT collection (if you need one and cannot find any on Devnet, please [contact us](mailto:meltedblocks@gmail.com)).
6. Go to [Blaster app](https://app.blaster.cash) and login using seller address.
7. Go to [Settings](https://app.blaster.cash/merchant-settings) and define your brand name and logo.
8. Go to [Products](https://app.blaster.cash/products/new) to create your product.
9. Optionally, if you’d like to test [Make](https://www.make.com/) integration, you need to create fee [Make](https://www.make.com/) account. Then go to [integrations](https://app.blaster.cash/integrations) and click _Connect to make_. Sample [Make](https://www.make.com/) setup is presented in Product Demo video.
10. Then you can [create payment link](https://app.blaster.cash/paylink/new):
    1. To use NFT discount you need NFT collection address. You can find it by searching your NFT address on [Solscan](https://solscan.io/), then go to Metadata tab and look for _root.collection.key_.\
11. Application should generate unique link for you. You can open this link and pay:
    1. using button on checkout page
    2. or using your mobile wallet by scanning QR code

If you have any problems or questions please feel free to [reach out to us](https://www.notion.so/Blaster-cash-Solana-Grizzlython-Submission-6d45dc78acdb408189ae5cebbe8bc9d3).
