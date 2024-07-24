'use client';

import { Analytics } from '@vercel/analytics/react';
import { Fragment } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Fragment>
      {children}
      <Analytics mode="production" />
    </Fragment>
  );
}
