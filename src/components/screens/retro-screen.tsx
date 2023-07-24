import { NextSeo } from 'next-seo';
import TransactionTable from '@/components/transaction/transaction-table';

//images
import PriceFeedSlider from '@/components/ui/live-price-feed';
import { priceFeedData } from '@/data/static/price-feed-retro';
import ComparisonChart from '@/components/ui/chats/retro-comparision-chart';

export default function RetroScreen({ orders, impressions }) {
  console.log(orders);
  return (
    <>
      <NextSeo
        title="Blaster - Get paid in a blast"
        description="Blaster - Get paid in a blast"
      />
      <div className="retro-container">
        <div>
          <ComparisonChart orders={orders || []} impressions={impressions} />
        </div>

        <div className="mt-7">
          <TransactionTable orders={orders || []} />
        </div>
      </div>
    </>
  );
}
