import React from 'react';
import Route from 'react-router/lib/Route';

import { requireAuthentication } from '../../components/AuthenticatedComponent';
import { Campaign } from '../../containers/Campaign';

export default (
  <div>
    <Route path="campaign" component={requireAuthentication(Campaign)} />
  </div>
);
