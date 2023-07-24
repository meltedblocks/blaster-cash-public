import routes from '@/config/routes';
import { HomeIcon } from '@/components/icons/home';
import { FarmIcon } from '@/components/icons/farm';
import { PoolIcon } from '@/components/icons/pool';
import { ProfileIcon } from '@/components/icons/profile';
import { DiskIcon } from '@/components/icons/disk';
import { ExchangeIcon } from '@/components/icons/exchange';
import { VoteIcon } from '@/components/icons/vote-icon';
import { PlusCircle } from '@/components/icons/plus-circle';
import { CompassIcon } from '@/components/icons/compass';

export const menuItems = [
  {
    name: 'Home',
    icon: <HomeIcon />,
    href: routes.home,
  },
  {
    name: 'Products',
    icon: <ExchangeIcon />,
    href: routes.vote,
    dropdownItems: [
      {
        name: 'Explore',
        href: routes.products,
      },
      {
        name: 'Create product',
        href: routes.createProduct,
      },
    ],
  },
  {
    name: 'Pay links',
    icon: <PlusCircle />,
    href: routes.payLinks,
    dropdownItems: [
      {
        name: 'Explore',
        href: routes.payLinks,
      },
      {
        name: 'Create Pay Link',
        href: routes.createPayLink,
      },
    ],
  },
  {
    name: 'Settings',
    icon: <ProfileIcon />,
    href: routes.merchantSettings,
  },
  {
    name: 'Integrations',
    icon: <CompassIcon />,
    href: routes.integrations,
  },
];
