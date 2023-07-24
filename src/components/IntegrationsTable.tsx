import React, { useState } from 'react';
import {
  useTable,
  useResizeColumns,
  useFlexLayout,
  useSortBy,
  usePagination,
} from 'react-table';
// static data
import axios from 'axios';
import Link from 'next/link';

const IntegrationsTable = ({ webhooks, setWebhooks }) => {
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
      maxWidth: 80,
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
                await axios.delete('/api/user/webhook/' + value);
                let webhooks2 = webhooks.reduce(
                  (p, c) => (c.id !== value && p.push(c), p),
                  []
                );
                setWebhooks(webhooks2);
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

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    nextPage,
    previousPage,
    prepareRow,
  } = useTable(
    {
      // @ts-ignore
      columns: COLUMNS,
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
      <div className="rounded-tl-lg rounded-tr-lg bg-white px-4 pt-6 dark:bg-light-dark md:px-8 md:pt-8">
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
    </>
  );
};

export default IntegrationsTable;
