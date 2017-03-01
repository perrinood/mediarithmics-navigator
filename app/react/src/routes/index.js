import React from 'react';
import Route from 'react-router/lib/Route';
import IndexRedirect from 'react-router/lib/IndexRedirect';

import { Navigator } from '../containers/Navigator';
import { NotFound } from '../containers/NotFound';

import CampaignRouter from './Campaign';


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
        <Route path="/v2">
          {CampaignRouter}
          <Route path="*" component={NotFound} />
        </Route>
        <Route path="*" component={NoMatch} />
      </Route>
    </div>
  );
};
