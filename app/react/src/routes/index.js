/* eslint-disable no-undef */

import React from 'react';
import Route from 'react-router/lib/Route';

import { Navigator } from '../containers/Navigator';
import { NotFound } from '../containers/NotFound';
import { TemporaryView } from '../containers/TemporaryView';

import CampaignRouter from './Campaign';
import LoginRouter from './Login';

// Dumb component to display when angular handle the app
class NoMatch extends React.Component {
  render() {
    return null;
  }
}

export default (store) => { // eslint-disable-line no-unused-vars
  return (
    <div>
      <Route path="/" component={Navigator}>
        <Route path={`${PUBLIC_URL}/organisation/:organisationId(/datamart/:datamartId)`} component={TemporaryView}>
          { CampaignRouter }
          <Route path="*" component={NotFound} />
        </Route>
        <Route path={`${PUBLIC_URL}`} component={TemporaryView}>
          {LoginRouter(store)}
          <Route path="*" component={NotFound} />
        </Route>
        <Route path="*" component={NoMatch} />
      </Route>
    </div>
  );
};
