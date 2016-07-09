'use strict';
import React from 'react';
import axios from 'axios';

const _options = {
  asap: false
};

export function propify(mapAjaxToProps = {}, options = {}) {
  return function renderPropify(ChildComponent) {
    return class PropifyAjax extends React.Component {
      constructor(props) {
        super(props);

        // options
        this.options = { ..._options, ...options };

        // state
        this.state = {};
      }

      componentDidMount() {
        const { asap } = this.options;

        // create ajaxProps anew
        const ajaxProps = {};

        // get object keys for the targets. This is necessary because
        // later we need to know which field we need to assign
        const keys = Object.keys(mapAjaxToProps);

        // map over mapAjaxToProps and fetch()
        const reqs = keys.map(target =>
          axios(this.normalizeTarget(mapAjaxToProps[target])).then(res => res.data)
        );

        // asap?
        if(asap) {
          reqs.forEach((req, idx) => req.then(data => {
            const fieldName = keys[idx];
            ajaxProps[fieldName] = data;

            this.setState({ ...this.state.ajaxProps, ...ajaxProps });
          }));
        }

        else {
          // Promise.settleAll
          console.log('non-asap');
          axios.all(reqs).then(axios.spread((...responses) => {
            responses.forEach((data, idx) => {
              const fieldName = keys[idx];
              ajaxProps[fieldName] = data;
            });

            // setState to rerender
            this.setState({ ...this.state.ajaxProps, ...ajaxProps });
          }));
        }
      }

      // TODO: make this work not only with get
      normalizeTarget(target) {
        return {
          method: 'get',
          url: target
        };
      }

      // render childcomponent
      render() {
        return (
          <ChildComponent {...this.props} {...this.state}/>
        );
      }
    };
  };
}
