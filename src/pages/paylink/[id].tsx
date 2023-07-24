// @ts-nocheck
import Button from '@/components/ui/button';
import Listbox from '@/components/ui/list-box';
import { Listbox as ListBoxCurrency } from '@/components/ui/listbox';
import type { NextPageWithLayout } from '@/types';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
// static data
import { BookIcon } from '@/components/icons/book';
import { ChevronDown } from '@/components/icons/chevron-down';
import { ExchangeIcon } from '@/components/icons/exchange';
import { FlashIcon } from '@/components/icons/flash';
import { Unlocked } from '@/components/icons/unlocked';
import InputFormik from '@/components/ui/forms/inputFormik';
import InputWithPercentage from '@/components/ui/forms/inputWithPercentage';
import InputWithUrl from '@/components/ui/forms/inputWithUrl';
import InputLabel from '@/components/ui/input-label';
import ToggleBar from '@/components/ui/toggle-bar';
import { Transition } from '@/components/ui/transition';
import RootLayout from '@/layouts/_root-layout';
import prisma from '@/lib/prisma';
import Errors from '@/utils/Errors';
import axios from 'axios';
import BigNumber from 'bignumber.js';
import { Form, Formik, FormikHelpers } from 'formik';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import * as Yup from 'yup';
import { authOptions } from '../api/auth/[...nextauth]';

const LinkSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').notRequired(),
  slug: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').notRequired(),
  redirectUrl: Yup.string().url().notRequired(),
  thankYouText: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!')
    .notRequired(),
});

interface Values {
  name: string;
  slug: string;
  redirectUrl: string;
  thankYouText: string;
  counter: number;
  expiration: string;
  amount: string;
  currency: string;
  requireEmail: boolean;
  discountPercentage: number;
  discountAddress: string;
  affiliatePercentage: number;
  affiliateAddress: string;
  affiliateShow: boolean;
  includeDiscount: boolean;
  includeAffiliate: boolean;
  webhook?: string;
}

const CurrencyOptions = [
  {
    id: 1,
    name: 'SOL',
    value: 'sol',
    basePoints: 1000000000,
  },
];

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions(context.req)
  );
  const products = await prisma.product.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      name: true,
      id: true,
    },
  });

  const productsParsed = products.map(({ id: value, ...rest }) => ({
    value,
    ...rest,
  }));

  const webhooks = await prisma.webhook.findMany({
    where: {
      userId: session.user.id,
    },
  });

  let webhookOptions = [
    {
      id: 'none',
      name: 'none',
      value: 'none',
    },
    ...webhooks,
  ];

  return {
    props: {
      products: productsParsed,
      appUrl: process.env.APP_URL,
      webhooks: webhookOptions,
    },
  };
};

function ChooseProduct({ products, setChoosenProduct, choosenProduct }) {
  return (
    choosenProduct && (
      <>
        <div className="">
          <div className="group mb-4 rounded-md bg-gray-100/90 p-5 pt-3 dark:bg-dark/60 xs:p-6 xs:pb-8">
            <>
              <Listbox
                className="w-full sm:w-80"
                options={products}
                selectedOption={choosenProduct}
                onChange={setChoosenProduct}
              />
            </>
          </div>
        </div>
      </>
    )
  );
}

function SetLinkProperties({ errors, webhook, setWebhook, webhooks }) {
  let [linkCounter, setLinkCounter] = useState(false);
  let [linkExpiration, setLinkExpiration] = useState(false);
  return (
    <>
      <InputFormik
        id="name"
        name="name"
        label="Name"
        error={errors.name}
        useUppercaseLabel={false}
        placeholder="Your unique link name"
        className=""
      />
      <InputWithUrl
        id="slug"
        name="slug"
        label="Slug"
        error={errors.slug}
        useUppercaseLabel={false}
        placeholder="5d905ffb-f2c4-4c99-99ff-2301d1c0e824"
        className="mt-8"
      />

      <InputFormik
        id="redirectUrl"
        name="redirectUrl"
        error={errors.redirectUrl}
        label="Redirect URL"
        useUppercaseLabel={false}
        placeholder="Page that user should be redirected to after payment"
        className="mt-8"
      />
      <InputFormik
        id="thankYouText"
        name="thankYouText"
        error={errors.thankYouText}
        label="Thank you text"
        useUppercaseLabel={false}
        placeholder="Text that will be showed in user's wallet on paying"
        className="mt-8"
      />
      <div className="mt-4">
        <InputLabel title="Webhook" />
        <div className="relative">
          <ListBoxCurrency value={webhook} onChange={setWebhook}>
            <ListBoxCurrency.Button className="text-case-inherit letter-space-inherit flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none transition-shadow duration-200 hover:border-gray-900 hover:ring-1 hover:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600 dark:hover:ring-gray-600 sm:h-12 sm:px-5">
              <div className="flex items-center">{webhook.name}</div>
              <ChevronDown />
            </ListBoxCurrency.Button>
            <Transition
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListBoxCurrency.Options className="absolute left-0 z-10 mt-1 grid w-full origin-top-right gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-large outline-none dark:border-gray-700 dark:bg-gray-800 xs:p-2">
                {webhooks.map((item) => (
                  <ListBoxCurrency.Option key={item.id} value={item}>
                    {({ selected }) => (
                      <div
                        className={`flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-gray-900 transition dark:text-gray-100  ${
                          selected
                            ? 'bg-gray-200/70 font-medium dark:bg-gray-600/60'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700/70'
                        }`}
                      >
                        {item.name}
                      </div>
                    )}
                  </ListBoxCurrency.Option>
                ))}
              </ListBoxCurrency.Options>
            </Transition>
          </ListBoxCurrency>
        </div>
      </div>
      <div className="mt-8">
        <ToggleBar
          title="Set counter"
          subTitle="Define number of purchase possible using this link"
          icon={<Unlocked />}
          checked={linkCounter}
          onChange={() => setLinkCounter(!linkCounter)}
        >
          {linkCounter && (
            <>
              <p className="mt-8">Functionality not suported yet</p>
            </>
          )}
        </ToggleBar>
      </div>

      <div className="mt-8">
        <ToggleBar
          title="Set expiration"
          subTitle="Define when link should expire"
          icon={<Unlocked />}
          checked={linkExpiration}
          onChange={() => setLinkExpiration(!linkExpiration)}
        >
          {linkExpiration && (
            <>
              <p className="mt-8">Functionality not suported yet</p>
            </>
          )}
        </ToggleBar>
      </div>
    </>
  );
}

function SetPricingProperties({ errors, setFieldValue }) {
  let [discounts, setDiscounts] = useState(false);
  let [affiliate, setAffiliate] = useState(false);
  let [showAffiliate, setShowAffiliate] = useState(true);
  let [currency, setCurrency] = useState(CurrencyOptions[0]);
  let [isRequireEmail, setIsRequireEmail] = useState(false);
  useEffect(() => {
    setFieldValue('includeAffiliate', affiliate);
    setFieldValue('includeDiscount', discounts);
    setFieldValue('affiliateShow', showAffiliate);
    setFieldValue('requireEmail', isRequireEmail);
  }, []);

  useEffect(() => {
    setFieldValue('includeAffiliate', affiliate);
    setFieldValue('includeDiscount', discounts);
    setFieldValue('affiliateShow', showAffiliate);
    setFieldValue('requireEmail', isRequireEmail);
  }, [discounts, affiliate, showAffiliate, isRequireEmail]);

  return (
    <>
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <InputFormik
          error={errors.amount}
          name="amount"
          id="amount"
          label="Price"
          useUppercaseLabel={false}
          placeholder="1"
          className="mt-4"
          required
        />

        <div className="mt-4">
          <InputLabel title="Currency" />
          <div className="relative">
            <ListBoxCurrency value={currency} onChange={setCurrency}>
              <ListBoxCurrency.Button className="text-case-inherit letter-space-inherit flex h-10 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-900 outline-none transition-shadow duration-200 hover:border-gray-900 hover:ring-1 hover:ring-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:hover:border-gray-600 dark:hover:ring-gray-600 sm:h-12 sm:px-5">
                <div className="flex items-center">{currency.name}</div>
                <ChevronDown />
              </ListBoxCurrency.Button>
              <Transition
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <ListBoxCurrency.Options className="absolute left-0 z-10 mt-1 grid w-full origin-top-right gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-large outline-none dark:border-gray-700 dark:bg-gray-800 xs:p-2">
                  {CurrencyOptions.map((option) => (
                    <ListBoxCurrency.Option key={option.id} value={option}>
                      {({ selected }) => (
                        <div
                          className={`flex cursor-pointer items-center rounded-md px-3 py-2 text-sm text-gray-900 transition dark:text-gray-100  ${
                            selected
                              ? 'bg-gray-200/70 font-medium dark:bg-gray-600/60'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700/70'
                          }`}
                        >
                          {option.name}
                        </div>
                      )}
                    </ListBoxCurrency.Option>
                  ))}
                </ListBoxCurrency.Options>
              </Transition>
            </ListBoxCurrency>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <ToggleBar
          title="Require email"
          subTitle="Require e-mail from customer upon payment"
          icon={<BookIcon />}
          checked={isRequireEmail}
          onChange={() => setIsRequireEmail(!isRequireEmail)}
        />
      </div>

      <div className="mt-8">
        <ToggleBar
          title="Set discounts"
          subTitle="Define NFT collections that should get discount"
          icon={<FlashIcon />}
          checked={discounts}
          onChange={() => setDiscounts(!discounts)}
        >
          {discounts && (
            <>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <InputWithPercentage
                  name="discountPercentage"
                  id="discountPercentage"
                  label="Amount"
                  useUppercaseLabel={false}
                  placeholder="1"
                  className="mt-4 w-20"
                  required
                />
                <InputFormik
                  name="discountAddress"
                  id="discountAddress"
                  label="Collection address"
                  useUppercaseLabel={false}
                  placeholder=""
                  className="mt-4"
                  required
                />
              </div>
            </>
          )}
        </ToggleBar>
      </div>

      <div className="mt-8">
        <ToggleBar
          title="Add affiliate"
          subTitle="Share your profit with affiliate"
          icon={<ExchangeIcon />}
          checked={affiliate}
          onChange={() => setAffiliate(!affiliate)}
        >
          {affiliate && (
            <>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <InputWithPercentage
                  name="affiliatePercentage"
                  id="affiliatePercentage"
                  label="Amount"
                  useUppercaseLabel={false}
                  placeholder="1"
                  className="mt-4 w-20"
                  required
                />
                <InputFormik
                  name="affiliateAddress"
                  id="affiliateAddress"
                  label="Affiliate address"
                  useUppercaseLabel={false}
                  placeholder=""
                  className="mt-4"
                  required
                />
              </div>
              <div className="mt-4">
                <ToggleBar
                  title="Show affiliate"
                  subTitle="Define if affiliate should be seen on checkout page"
                  checked={showAffiliate}
                  onChange={() => setShowAffiliate(!showAffiliate)}
                ></ToggleBar>
              </div>
            </>
          )}
        </ToggleBar>
      </div>
    </>
  );
}

const CreateLinkPage: NextPageWithLayout = (props: any) => {
  let [choosenProduct, setChoosenProduct] = useState(props.products[0]);
  let [webhook, setWebhook] = useState(props.webhooks[0]);
  let [newSlug, setNewSlug] = useState('');
  let [areProducts, setIsNoProducts] = useState(
    props.products && props.products.length !== 0
  );
  const router = useRouter();

  return (
    <>
      <NextSeo title="Create Pay Link" description="Create unique pay link" />
      <section className="mx-auto w-full max-w-[1160px] text-sm">
        {!newSlug && areProducts && (
          <>
            <h2 className="mb-5 text-lg font-medium dark:text-gray-100 sm:mb-6 lg:mb-7 xl:text-xl">
              Create a new pay link
            </h2>

            <Formik
              initialValues={{
                name: '',
                slug: '',
                redirectUrl: '',
                thankYouText: '',
                counter: '',
                expiration: '',
                amount: '',
                currency: '',
                requireEmail: '',
                discountPercentage: '',
                discountAddress: '',
                affiliatePercentage: '',
                affiliateAddress: '',
                affiliateShow: '',
              }}
              validationSchema={LinkSchema}
              onSubmit={async (
                values: Values,
                { setErrors }: FormikHelpers<Values>
              ) => {
                try {
                  const valuesClone = { ...values };
                  if (!valuesClone.includeAffiliate) {
                    valuesClone.affiliateAddress = undefined;
                    valuesClone.affiliatePercentage = undefined;
                  }
                  if (!valuesClone.includeDiscount) {
                    valuesClone.discountAddress = undefined;
                    valuesClone.discountPercentage = undefined;
                  }
                  if (webhook.id !== 'none') {
                    valuesClone.webhook = webhook.id;
                  }
                  valuesClone.amount = new BigNumber(values.amount)
                    .multipliedBy(CurrencyOptions[0].basePoints)
                    .toString();
                  const result = await axios.post('/api/paylink/new', {
                    ...valuesClone,
                    productId: choosenProduct.value,
                  });

                  setNewSlug(result.data.slug);
                } catch (e) {
                  if (e?.response?.data?.error === 'SLUG_TAKEN') {
                    setErrors({ slug: Errors.SLUG_TAKEN });
                  }
                  console.log(e);
                }
              }}
            >
              {({ errors, touched, isSubmitting, setFieldValue }) => (
                <Form>
                  <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
                    <h3 className="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg">
                      Product
                    </h3>
                    <p className="mb-5 leading-[1.8] dark:text-gray-300">
                      Choose existing product
                    </p>
                    <ChooseProduct
                      products={props.products}
                      setChoosenProduct={setChoosenProduct}
                      choosenProduct={choosenProduct}
                    />
                  </div>

                  <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
                    <h3 className="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg">
                      Link Settings
                    </h3>
                    <SetLinkProperties
                      errors={errors}
                      webhook={webhook}
                      setWebhook={setWebhook}
                      webhooks={props.webhooks}
                    />
                  </div>
                  <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
                    <h3 className="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg">
                      Pricing
                    </h3>
                    <SetPricingProperties
                      errors={errors}
                      setFieldValue={setFieldValue}
                    />
                  </div>
                  <div className="mt-6">
                    <Button
                      size="large"
                      shape="rounded"
                      fullWidth={true}
                      className="xs:w-64 md:w-72"
                      type="submit"
                      isLoading={isSubmitting}
                    >
                      Create Link
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </>
        )}
        {newSlug && (
          <>
            <h2 className="mb-5 text-lg font-medium dark:text-gray-100 sm:mb-6 lg:mb-7 xl:text-xl">
              Create a new pay link
            </h2>
            <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
              <h3 className="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg">
                Your payment link:{' '}
                <a
                  className="font-bold underline"
                  href={`${props.appUrl}/pay/` + newSlug}
                >
                  {props.appUrl}/pay/{newSlug}
                </a>
              </h3>
            </div>
          </>
        )}
        {!areProducts && (
          <>
            <h2 className="mb-5 text-lg font-medium dark:text-gray-100 sm:mb-6 lg:mb-7 xl:text-xl">
              Create a new pay link
            </h2>
            <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
              <h3 className="mb-2 text-base dark:text-gray-100">
                Create product first
              </h3>
              <Button
                size="small"
                shape="rounded"
                fullWidth={true}
                className="mt-8 xs:w-64 md:w-72"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/products/new');
                }}
              >
                Create New Product
              </Button>
            </div>
          </>
        )}
      </section>
    </>
  );
};

CreateLinkPage.getLayout = function getLayout(page) {
  return <RootLayout>{page}</RootLayout>;
};

export default CreateLinkPage;
