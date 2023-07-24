import BigNumber from 'bignumber.js';

const getTotalBuys = (orders) => {
  let total = new BigNumber(0);
  let totalBuys = 0;

  if (!orders) {
    return { totalInSol: 0, totalBuys: 0 };
  }

  orders.forEach((order) => {
    if (order.status === 'SUCCESS' && order.finalAmount) {
      totalBuys += 1;
      total = total.plus(new BigNumber(order.finalAmount));
    }
  });

  if (total.eq(0)) {
    return { totalInSol: total.toString(), totalBuys };
  }

  const totalInSol = total.div(1000000000).toFixed(2).toString();

  return { totalInSol, totalBuys };
};

const getBuyRatio = (totalBuys, impressions) => {
  const totalBuysNum = new BigNumber(totalBuys);
  const impressionsNum = new BigNumber(impressions);

  if (totalBuysNum.eq(0) || impressionsNum.eq(0)) {
    return 0;
  }

  return totalBuysNum
    .div(impressionsNum)
    .multipliedBy(100)
    .toFixed(2)
    .toString();
};

export default function ComparisonChart({ orders, impressions }) {
  const { totalInSol, totalBuys } = getTotalBuys(orders);
  const buyRatio = getBuyRatio(totalBuys, impressions);

  return (
    <>
      <div className="rounded-tl-lg rounded-tr-lg bg-white px-4 pt-6 dark:bg-light-dark md:px-8 md:pt-8">
        <div className="flex flex-col items-center justify-between border-b border-dashed border-gray-200 pb-5 dark:border-gray-700 md:flex-row">
          <h2 className="mb-3 shrink-0 text-lg font-medium uppercase text-black dark:text-white sm:text-xl md:mb-0 md:text-2xl">
            Stats
          </h2>
        </div>
      </div>
      <div className="light:border light:border-slate-200 rounded-lg bg-white p-6 shadow-card dark:bg-light-dark sm:p-8">
        <div className="flex flex-col-reverse justify-between gap-8 md:items-start lg:flex-row lg:items-center lg:gap-4">
          <div>
            <div className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:text-base">
              <p className="text-center text-2xl font-semibold text-green-500 xl:text-4xl">
                {totalInSol} SOL
              </p>
            </div>
            <p className={'mt-2 text-center text-sm font-bold uppercase'}>
              <span className="">Earnings</span>
            </p>
          </div>
          <div>
            <div className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:text-base">
              <p className="text-center text-2xl font-semibold text-green-500 xl:text-4xl">
                {impressions || 0}
              </p>
            </div>
            <p className={'mt-2 text-center text-sm font-bold uppercase'}>
              <span className="">Impressions</span>
            </p>
          </div>
          <div>
            <div className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:text-base">
              <p className="text-center text-2xl font-semibold text-green-500 xl:text-4xl">
                {totalBuys}
              </p>
            </div>
            <p className={'mt-2 text-center text-sm font-bold uppercase'}>
              <span className="">Total buys</span>
            </p>
          </div>
          <div>
            <div className="text-sm uppercase tracking-wider text-gray-600 dark:text-gray-400 sm:text-base">
              <p className="text-center text-2xl font-semibold text-green-500 xl:text-4xl">
                {buyRatio} %
              </p>
            </div>
            <p className={'mt-2 text-center text-sm font-bold uppercase'}>
              <span className="">Buy Rate</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
