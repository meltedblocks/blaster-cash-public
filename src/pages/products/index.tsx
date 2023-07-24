import Button from '@/components/ui/button';
import type { NextPageWithLayout } from '@/types';
import { GetServerSideProps } from 'next';
import { NextSeo } from 'next-seo';
import { useRouter } from 'next/router';
import React from 'react';
import {
  useFlexLayout,
  usePagination,
  useResizeColumns,
  useSortBy,
  useTable,
} from 'react-table';
// static data
import RootLayout from '@/layouts/_root-layout';
import prisma from '@/lib/prisma';
import axios from 'axios';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '../api/auth/[...nextauth]';

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
      description: true,
      image: true,
      id: true,
    },
  });
  return {
    props: { products },
  };
};
const ProductsPage: NextPageWithLayout = (props: any) => {
  const router = useRouter();
  const [data, setData] = React.useState(
    React.useMemo(() => props.products, [])
  );

  const COLUMNS = [
    {
      Header: () => <div>IMAGE</div>,
      accessor: 'image',
      // @ts-ignore
      Cell: ({ cell: { value } }) => (
        <>
          <img className="max-w-24 max-h-24" src={value} />
        </>
      ),
      minWidth: 30,
      maxWidth: 50,
    },
    {
      Header: 'NAME',
      accessor: 'name',
      minWidth: 60,
      maxWidth: 80,
    },
    {
      Header: 'DESCRIPTION',
      accessor: 'description',
      minWidth: 60,
      maxWidth: 80,
    },
    {
      Header: () => <div></div>,
      accessor: 'id',
      // @ts-ignore
      Cell: ({ cell: { value } }) => (
        <>
          <div className="-tracking-[1px] ltr:text-right rtl:text-left">
            <div>
              <Link href={'/products/' + value}>Edit</Link>
              <Link
                className="pl-24"
                href={''}
                onClick={async (e) => {
                  e.preventDefault();
                  await axios.delete('/api/product/' + value);
                  setData(
                    data.reduce((p, c) => (c.id !== value && p.push(c), p), [])
                  );
                }}
              >
                Delete
              </Link>
            </div>
          </div>
        </>
      ),
      minWidth: 60,
      maxWidth: 80,
    },
  ];

  const columns = React.useMemo(() => COLUMNS, []);

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
      data,
      initialState: { pageSize: 5 },
    },
    useSortBy,
    useResizeColumns,
    useFlexLayout,
    usePagination
  );
  return (
    <>
      <NextSeo title="Your Products" description="Create a product" />
      <section className="mx-auto w-full max-w-[1160px] text-sm">
        <div className="rounded-tl-lg rounded-tr-lg bg-white px-4 pt-6 dark:bg-light-dark md:px-8 md:pt-8">
          <div className="flex flex-col items-center justify-between border-b border-dashed border-gray-200 pb-5 dark:border-gray-700 md:flex-row">
            <h2 className="mb-3 shrink-0 text-lg font-medium uppercase text-black dark:text-white sm:text-xl md:mb-0 md:text-2xl">
              Your products
            </h2>
            <div className="mb-3 shrink-0 text-lg font-medium uppercase text-black dark:text-white sm:text-xl md:mb-0 md:text-2xl">
              <Button
                size="small"
                shape="rounded"
                fullWidth={true}
                className="xs:w-64 md:w-72"
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/products/new');
                }}
              >
                Create New Product
              </Button>
            </div>
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
                      {...column.getHeaderProps(column.getSortByToggleProps())}
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
      </section>
    </>
  );
};

ProductsPage.getLayout = function getLayout(page) {
  return <RootLayout>{page}</RootLayout>;
};

export default ProductsPage;
