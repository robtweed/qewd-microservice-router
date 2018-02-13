/*

 ----------------------------------------------------------------------------
 | qewd-microservice-router: Express Integration Module for QEWD            |
 |                                                                          |
 | Copyright (c) 2016-18 M/Gateway Developments Ltd,                        |
 | Redhill, Surrey UK.                                                      |
 | All rights reserved.                                                     |
 |                                                                          |
 | http://www.mgateway.com                                                  |
 | Email: rtweed@mgateway.com                                               |
 |                                                                          |
 |                                                                          |
 | Licensed under the Apache License, Version 2.0 (the "License");          |
 | you may not use this file except in compliance with the License.         |
 | You may obtain a copy of the License at                                  |
 |                                                                          |
 |     http://www.apache.org/licenses/LICENSE-2.0                           |
 |                                                                          |
 | Unless required by applicable law or agreed to in writing, software      |
 | distributed under the License is distributed on an "AS IS" BASIS,        |
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
 | See the License for the specific language governing permissions and      |
 |  limitations under the License.                                          |
 ----------------------------------------------------------------------------

  12 February 2018

  MicroService Routing Module

  Routing tables will have been set up by qewd/lib/microServices during
  master process startup

*/

'use strict';

var debug = require('debug')('qewd-microservice-router');

var requestId = 0;  // unique request counter (to link requests and responses)

function countDestinations(destination) {
  var response = {
    count: 0,
    destinations: []
  };

  /*jshint camelcase: false */
  var destinations = this.u_services.byDestination;
  /*jshint camelcase: true */

  function getDestinations(destination) {
    var destObj = destinations[destination];
    debug('destination: %s', JSON.stringify(destination));
    debug('destObj: %s', JSON.stringify(destObj));

    if (!destObj || !destObj.destinations) {
      return;
    }

    destObj.destinations.forEach(function(destination) {
      var destObj = destinations[destination];
      if (destObj.destinations) {
        getDestinations(destination);
      }
      else {
        response.count++;
        response.destinations.push(destination);
      }
    });
  }

  debug('count destinations');
  getDestinations(destination);
  debug('count destinations response: %s', JSON.stringify(response));

  return response;
}

function sendToMicroService(jwt, message, microService, route, handleResponse) {
  var msg = {
    type: 'ewd-jwt-updateExpiry',
    params: {
      jwt: jwt,
      application: microService.application
    }
  };

  debug('updating jwt expiry: %s', JSON.stringify(msg));

  this.handleMessage(msg, function(responseObj) {

    requestId++;

    var messageObj = {
      application: microService.application,
      type: 'restRequest',
      path: message.path,
      pathTemplate: route.pathTemplate,
      method: message.method,
      headers: message.headers,
      params: message.params,
      query: message.query,
      body: message.body,
      ip: message.ip,
      ips: message.ips,
      token: responseObj.message.jwt,
      args: route.args,
      jwt: true,
      ms_requestId: requestId
    };

    debug('sending micro-service request over websocket to remote system: %s', JSON.stringify(messageObj));

    microService.client.send(messageObj, handleResponse);
  });
}

function handleMicroService(message, route, destination, handleResponse) {
  /*jshint camelcase: false */
  var microService = this.u_services.byDestination[destination];
  /*jshint camelcase: true */

  debug('handling micro-service %s for %s destination', JSON.stringify(microService), destination);

  if (!microService || !microService.client || !microService.client.send) {
    return handleResponse({
      message: {
        error: 'MicroService incorrectly defined for destination: ' + destination
      }
    });
  }

  // incoming REST message is repackaged as a QEWD WebSocket message and sent
  //  over the micro-service socket interface to the micro-service host system

  // any incoming API that doesn't include a valid JWT should be given a
  //  nominal one using the QEWD client registration one - this is simply
  //  to allow the remote QEWD websocket interface to not immediately reject it
  //  the nominal one must have the expiry updated

  var token = this.jwt.handlers.getRestJWT(message);
  debug('jwt: %s', token);
  debug('route = %s', JSON.stringify(route));

  if (token === '' || token === 'undefined') {
    debug('using updated registration JWT');

    token = microService.client.token;

    // we must also update the application - remote system uses the value
    // in the JWT to determine the application to load
    // prevents arbitrary application change attempts
    sendToMicroService.call(this, token, message, microService, route, handleResponse);
  }
  else if (route.bypassJWTCheck) {
    debug('JWT check being bypassed');

    // incoming JWT is to be ignored by primary; forward it to the MicroService
    // which will be responsible for checking the JWT
    sendToMicroService.call(this, token, message, microService, route, handleResponse);
  } else {
    debug('validating message JWT');

    // JWT is first validated in worker (to reduce master process CPU load)
    var msg = {
      type: 'ewd-jwt-isValid',
      params: {
        jwt: token
      }
    };

    var q = this;
    this.handleMessage(msg, function(responseObj) {
      var status = responseObj.message;
      if (!status.ok) {
        // return standard QEWD WebSocket error response object
        handleResponse({
          message: {
            error: status.error
          }
        });

        return;
      }

      // incoming JWT is valid, so send it to the MicroService
      sendToMicroService.call(q, token, message, microService, route, handleResponse);
    });
  }
}

function microServiceRouter(message, handleResponse) {
  debug('testing route for message: %s', JSON.stringify(message));

  /*jshint camelcase: false */
  debug('restRoutes: %s', JSON.stringify(this.u_services.restRoutes));
  debug('destinations: %s', JSON.stringify(this.u_services.byDestination));

  var self = this;
  var route = this.router.hasRoute(message.path, message.method, this.u_services.restRoutes);
  /*jshint camelcase: true */

  debug('route: %s', JSON.stringify(route));

  if (route.matched) {
    // route.args         - variables found in route, which may include destination;
    // route.destination  - explicitly-defined destination for route
    // route.pathTemplate - original path template on which route was matched

    // destination may be explicitly defined for path, or defined by path itself (ie in args)
    //  destination defined in path will over-ride an explicitly-defined one

    if (route.onRequest && typeof route.onRequest === 'function') {
      // hand control over the user's onRequest function to do the routing etc
      var args = {
        req: message
      };

      /*jshint forin: false */
      for (var name in route.args) {
        args[name] = route.args[name];
      }
      /*jshint forin: true */

      args.req.pathTemplate = route.pathTemplate;
      args.jwt = this.jwt.handlers.getRestJWT(message);

      debug('calling route.onRequest with args: %s', JSON.stringify(args));

      var send = microServiceRouter.bind(this);
      route.onRequest.call(this, args, send, handleResponse);

      return true;
    }

    var destination = route.args.destination || route.destination;
    if (destination) {
      /*jshint camelcase: false */
      var destObj = this.u_services.byDestination[destination];
      /*jshint camelcase: true */

      if (!destObj) {
        handleResponse({
          message: {
            error: 'No such destination: ' + destination
          }
        });

        return true;
      }

      debug('destObj: %s', JSON.stringify(destObj));

      if (!destObj.destinations) {
        // single destination
        debug('single destination');

        handleMicroService.call(this, message, route, destination, function(response) {
          var handled = false;

          if (route.onResponse && typeof route.onResponse === 'function') {
            debug('calling route.onResponse with responseObj: %s', response);
            handled = route.onResponse.call(self, {
              message: message,
              destination: destination,
              responseObj: response,
              handleResponse: handleResponse,
              send: microServiceRouter.bind(self)
            });
          }

          debug('handled: %s', JSON.stringify(handled));

          if (!handled) {
            if (!response.message && response.error) {
              response.message = {
                error: response.error
              };
              delete response.error;
            }

            debug('handleResponse: %s', JSON.stringify(response));
            handleResponse(response);
          }
        });
      }
      else {
        // mutiple destinations
        debug('mutiple destinations');

        var destinationGroup = destination;
        var results = countDestinations.call(this, destination);
        var count = 0;
        var noOfErrors = 0;
        var noOfDestinations = results.count;
        var compositeResponse = {};
        var token;

        results.destinations.forEach(function(destination) {
          handleMicroService.call(self, message, route, destination, function(response) {
            delete response.finished;
            delete response.type;

            if (!response.message && response.error) {
              response.message = {
                error: response.error
              };
              delete response.error;
            }

            if (response.message.error) {
              noOfErrors++;
            }

            if (!token && response.message.token) {
              token = response.message.token + '';
            }

            delete response.message.token;

            compositeResponse[destination] = response.message;
            count++;

            if (count === noOfDestinations) {
              var responseObj;

              if (noOfErrors === noOfDestinations) {
                var currentError;
                var lastError = '';
                var sameError = true;

                /*jshint forin: false */
                for (var dest in compositeResponse) {
                  currentError = compositeResponse[dest].error;
                  if (lastError !== '' && currentError !== lastError) {
                    sameError = false;
                    break;
                  }
                  lastError = currentError;
                }
                /*jshint forin: true */

                if (sameError) {
                  responseObj = {
                    type: message.type,
                     message: {
                      error: lastError
                    }
                  };
                }
                else {
                  responseObj = {
                    type: message.type,
                     message: {
                      error: {
                        destinations: compositeResponse
                      }
                    }
                  };
                }
              }
              else {
                responseObj = {
                  type: message.type,
                  message: {
                    results: compositeResponse,
                    token: token
                  }
                };
              }

              var handled = false;

              if (route.onResponse && typeof route.onResponse === 'function') {
                debug('calling route.onResponse with responseObj: %s', response);
                handled = route.onResponse.call(self, {
                  message: message,
                  destination: destinationGroup,
                  responseObj: responseObj,
                  handleResponse: handleResponse,
                  send: microServiceRouter.bind(self)
                });
              }

              debug('handled: %s', JSON.stringify(handled));

              if (!handled) {
                debug('handleResponse: %s', JSON.stringify(responseObj));
                handleResponse(responseObj);
              }
            }
          });
        });
      }

      return true;
    }
  }

  return false;
}

module.exports = microServiceRouter;
