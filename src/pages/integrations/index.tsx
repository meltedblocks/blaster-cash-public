import Button from '@/components/ui/button';
import ParamTab, { TabPanel } from '@/components/ui/param-tab';
import type { NextPageWithLayout } from '@/types';
import cn from 'classnames';
import { NextSeo } from 'next-seo';

// static data
import IntegrationComingSoon from '@/components/IntegrationComingSoon';
import InputFormik from '@/components/ui/forms/inputFormik';
import InputLabel from '@/components/ui/input-label';
import RootLayout from '@/layouts/_root-layout';
import { LAYOUT_OPTIONS } from '@/lib/constants';
import { useLayout } from '@/lib/hooks/use-layout';
import prisma from '@/lib/prisma';
import axios from 'axios';
import { Form, Formik, FormikHelpers } from 'formik';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  useFlexLayout,
  usePagination,
  useResizeColumns,
  useSortBy,
  useTable,
} from 'react-table';
import * as Yup from 'yup';
import { authOptions } from '../api/auth/[...nextauth]';
import ErrorBox from '@/components/ErrorBox';
import MakeImage from '@/assets/images/make.png';
import { motion } from 'framer-motion';
import Image from '@/components/ui/image';

interface ApiKeyValues {
  apiKey?: string;
}

interface WebHookValues {
  name: string;
  url: string;
}

interface Integrations {
  apiKey: string;
  webhooks: any[];
}
const WebhookSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required(),
  url: Yup.string().url().required(),
});

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(
    context.req,
    context.res,
    authOptions(context.req)
  );
  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
  });

  const webhooks = await prisma.webhook.findMany({
    where: {
      userId: session.user.id,
    },
  });

  return {
    props: {
      apiKey: user.apiKey,
      webhooks,
    },
  };
};

const ProposalsPage: NextPageWithLayout = (props: Integrations) => {
  const { layout } = useLayout();
  const [webhooks, setWebhooks] = useState(useMemo(() => props.webhooks, []));
  const [errorText, setErrorText] = useState('');

  const tabMenuItems = [
    {
      title: <>Make </>,
      path: 'make',
    },
    {
      title: <>Zapier</>,
      path: 'zapier',
    },
    {
      title: <>IFTTT </>,
      path: 'IFTTT',
    },
  ];

  const COLUMNS = [
    {
      Header: 'NAME',
      accessor: 'name',
      minWidth: 60,
      maxWidth: 80,
    },
    {
      Header: 'URL',
      accessor: 'url',
      minWidth: 60,
      maxWidth: 280,
    },

    {
      Header: () => <div></div>,
      accessor: 'id',
      // @ts-ignore
      Cell: ({ cell: { value } }) => (
        <>
          <div>
            <Link
              className=""
              href={''}
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await axios.delete('/api/user/webhook/' + value);
                  setWebhooks(
                    webhooks.reduce(
                      (p, c) => (c.id !== value && p.push(c), p),
                      []
                    )
                  );
                } catch (e) {
                  setErrorText(
                    'Webhook is used in existing link. Cannot remove.'
                  );
                }
              }}
            >
              Delete
            </Link>
          </div>
          {/* </div> */}
        </>
      ),
      minWidth: 60,
      maxWidth: 80,
    },
  ];
  const columns = useMemo(() => COLUMNS, []);

  const {
    getTableProps,
    getTableBodyProps,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state,
    headerGroups,
    page,
    nextPage,
    previousPage,
    prepareRow,
  } = useTable(
    {
      // @ts-ignore
      columns,
      // @ts-ignore
      data: webhooks,
      initialState: { pageSize: 5 },
    },
    useSortBy,
    useResizeColumns,
    useFlexLayout,
    usePagination
  );

  return (
    <>
      <NextSeo
        title="Integrations"
        description="Blaster - Get paid in a blast"
      />
      <section className="mx-auto w-full max-w-[1160px] text-sm ">
        <header
          className={cn(
            'mb-8 gap-4 rounded-lg bg-white p-5 py-6 shadow-card dark:bg-light-dark xs:p-6 ',
            {
              'sm:flex-row sm:items-center sm:justify-between':
                layout !== LAYOUT_OPTIONS.RETRO,
              'lg:flex-row lg:items-center lg:justify-between':
                layout === LAYOUT_OPTIONS.RETRO,
            }
          )}
        >
          <Formik
            initialValues={{
              apiKey: props.apiKey || '',
            }}
            onSubmit={async (
              values,
              {
                setSubmitting,
                setStatus,
                setFieldValue,
              }: FormikHelpers<ApiKeyValues>
            ) => {
              const {
                data: { apiKey },
              } = await axios.post('/api/user/apikey');
              setFieldValue('apiKey', apiKey);
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-1 lg:grid-cols-3">
                  <div>
                    <InputLabel title="API Key" important />
                    <InputFormik
                      id="apiKey"
                      name="apiKey"
                      type="text"
                      disabled
                    />
                  </div>
                  <Button
                    size="small"
                    shape="rounded"
                    className="xs:w-64 sm:mt-8 md:w-72"
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    Generate New Key
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
          <Formik
            initialValues={{
              name: '',
              url: '',
            }}
            validationSchema={WebhookSchema}
            onSubmit={async (
              values,
              {
                setSubmitting,
                setStatus,
                setFieldValue,
                setFieldError,
                setErrors,
              }: FormikHelpers<WebHookValues>
            ) => {
              const {
                data: { id: webhookId },
              } = await axios.post('/api/user/webhook/new', {
                name: values.name,
                url: values.url,
              });
              setWebhooks([
                ...webhooks,
                {
                  id: webhookId,
                  name: values.name,
                  url: values.url,
                },
              ]);
              setFieldValue('name', '');
              setFieldValue('url', '');
              setFieldError('name', null);
              setFieldError('url', null);
              setErrors(null);
            }}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <div className="mt-8 grid gap-y-6 gap-x-4 sm:grid-cols-1 lg:grid-cols-3">
                  <div>
                    <InputLabel title="Webhook Name" important />
                    <InputFormik
                      id="name"
                      name="name"
                      type="text"
                      error={errors.name}
                    />
                  </div>
                  <div>
                    <InputLabel title="Webhook URL" important />
                    <InputFormik
                      id="url"
                      name="url"
                      type="text"
                      error={errors.url}
                    />
                  </div>
                  <Button
                    size="small"
                    shape="rounded"
                    className="xs:w-64 sm:mt-8 md:w-72"
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    Add Webhook
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </header>
        <>
          <div className="rounded-tl-lg rounded-tr-lg bg-white px-4 pt-6 dark:bg-light-dark md:px-8 md:pt-8">
            {errorText && (
              <ErrorBox errorText={errorText} setErrorText={setErrorText} />
            )}
            <div className="flex flex-col items-center justify-between border-b border-dashed border-gray-200 pb-5 dark:border-gray-700 md:flex-row">
              <h2 className="mb-3 shrink-0 text-lg font-medium uppercase text-black dark:text-white sm:text-xl md:mb-0 md:text-2xl">
                Your Webhooks
              </h2>
            </div>
          </div>
          <div className="px-0.5">
            <table
              {...getTableProps()}
              className="transaction-table w-full border-separate border-0"
            >
              <thead className="text-sm text-gray-500 dark:text-gray-300">
                {headerGroups.map((headerGroup, idx) => (
                  <tr {...headerGroup.getHeaderGroupProps()} key={idx}>
                    {headerGroup.headers.map((column, idx) => (
                      <th
                        {...column.getHeaderProps(
                          column.getSortByToggleProps()
                        )}
                        key={idx}
                        className="group  bg-white px-2 py-5 font-normal first:rounded-bl-lg last:rounded-br-lg ltr:first:pl-8 ltr:last:pr-8 rtl:first:pr-8 rtl:last:pl-8 dark:bg-light-dark md:px-4"
                      >
                        <div className="flex items-center">
                          {column.render('Header')}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody
                {...getTableBodyProps()}
                className="text-xs font-medium text-gray-900 dark:text-white 3xl:text-sm"
              >
                {page.map((row, idx) => {
                  prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      key={idx}
                      className="mb-3 items-center rounded-lg bg-white shadow-card last:mb-0 dark:bg-light-dark"
                    >
                      {row.cells.map((cell, idx) => {
                        return (
                          <td
                            {...cell.getCellProps()}
                            key={idx}
                            className="px-2 py-4 tracking-[1px] ltr:first:pl-4 ltr:last:pr-4 rtl:first:pr-8 rtl:last:pl-8 md:px-4 md:py-6 md:ltr:first:pl-8 md:ltr:last:pr-8 3xl:py-5"
                          >
                            {cell.render('Cell')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
        <ParamTab tabMenu={tabMenuItems}>
          <TabPanel className="focus:outline-none">
            <motion.div
              layout
              initial={{ borderRadius: 16 }}
              className="rounded-2xl"
            >
              <div className="flex flex-col items-center justify-center rounded-lg bg-white px-4 py-16 text-center shadow-card dark:bg-light-dark xs:px-6 md:px-5 md:py-24">
                <div className="mb-6 flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white shadow-card md:h-24 md:w-24">
                  <>
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://www.make.com/en/hq/app-invitation/2552a25c9fa0b44cde75b9b77afa0ef3"
                    >
                      <Image
                        src={MakeImage}
                        alt="make.com logo"
                        width={150}
                        height={150}
                        priority
                        className="rounded-full"
                      />
                    </a>
                  </>
                </div>
                <h2 className="mb-3 text-base font-medium leading-relaxed dark:text-gray-100 md:text-lg xl:text-xl">
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://www.make.com/en/hq/app-invitation/2552a25c9fa0b44cde75b9b77afa0ef3"
                  >
                    Connect to Make.com
                  </a>
                </h2>
              </div>
            </motion.div>
          </TabPanel>
          <TabPanel className="focus:outline-none">
            <>
              <IntegrationComingSoon />
            </>
          </TabPanel>
          <TabPanel className="focus:outline-none">
            <IntegrationComingSoon />
          </TabPanel>
        </ParamTab>
      </section>
    </>
  );
};

ProposalsPage.getLayout = function getLayout(page) {
  return <RootLayout>{page}</RootLayout>;
};

export default ProposalsPage;
function setData(arg0: any) {
  throw new Error('Function not implemented.');
}
