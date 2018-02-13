'use strict';

module.exports = function (boot) {
  var q;
  var messageObj;
  var handleResponse;
  var destinations = ['sms_service', 'log_service'];

  return {
    whenNoTokenReturned: function () {
      beforeEach(function (done) {
        boot(function (_q, _messageObj, _handleResponse) {
          q = _q;
          messageObj = _messageObj;
          handleResponse = _handleResponse;

          done();
        });
      });

      it('should call handleMessage 2 times with correct arguments', function () {
        q.microServiceRouter(messageObj, handleResponse);

        expect(q.handleMessage).toHaveBeenCalledTimes(2);
        expect(q.handleMessage.calls.argsFor(0)[0]).toEqual({
          type: 'ewd-jwt-updateExpiry',
          params: {
            jwt: 'token4',
            application: 'sms-micro-service'
          }
        }, jasmine.any(Function));
        expect(q.handleMessage.calls.argsFor(1)[0]).toEqual({
          type: 'ewd-jwt-updateExpiry',
          params: {
            jwt: 'token5',
            application: 'log-micro-service'
          }
        }, jasmine.any(Function));
      });

      it('should call microservice client #send 2 times with correct arguments', function () {
        q.microServiceRouter(messageObj, handleResponse);

        destinations.forEach(function (destination) {
          /*jshint camelcase: false */
          var microService = q.u_services.byDestination[destination];
          /*jshint camelcase: true */

          expect(microService.client.send).toHaveBeenCalledWith({
            application: microService.application,
            type: 'restRequest',
            path: '/api/users',
            pathTemplate: '/path/template',
            method: 'POST',
            headers: {
              'x-foo': 'bar'
            },
            params: {
              type: 'foo'
            },
            query: {
              bar: 'baz'
            },
            body: {
              login: 'johndoe',
              password: 'secret'
            },
            ip: '127.0.0.1',
            ips: ['client'],
            token: 'updated-jwt-token',
            args: {},
            jwt: true
          }, jasmine.any(Function));
        });
      });

      it('should call handleResponse with composite result', function () {
        /*jshint camelcase: false */
        var expected = {
          type: 'hello',
          message: {
            results: {
              sms_service: {
                application: 'sms-micro-service'
              },
              log_service: {
                application: 'log-micro-service',
              }
            },
            token: 'updated-jwt-token'
          }
        };
        /*jshint camelcase: true */

        destinations.forEach(function (destination) {
          /*jshint camelcase: false */
          var microService = q.u_services.byDestination[destination];
          /*jshint camelcase: true */

          microService.client.send.and.callFake(function (message, cb) {
            var responseObj = {
              message: {
                application: message.application,
                token: message.token
              },
              type: message.application + '-type',
              finished: true
            };
            cb(responseObj);
          });
        });

        q.microServiceRouter(messageObj, handleResponse);

        expect(handleResponse).toHaveBeenCalledWith(expected);
      });
    },

    whenTokenHasValueUndefined: function () {
      beforeEach(function (done) {
        boot(function (_q, _messageObj, _handleResponse) {
          q = _q;
          messageObj = _messageObj;
          handleResponse = _handleResponse;

          done();
        });
      });

      it('should call handleMessage 2 times with correct arguments', function () {
        q.microServiceRouter(messageObj, handleResponse);

        expect(q.handleMessage).toHaveBeenCalledTimes(2);
        expect(q.handleMessage.calls.argsFor(0)[0]).toEqual({
          type: 'ewd-jwt-updateExpiry',
          params: {
            jwt: 'token4',
            application: 'sms-micro-service'
          }
        }, jasmine.any(Function));
        expect(q.handleMessage.calls.argsFor(1)[0]).toEqual({
          type: 'ewd-jwt-updateExpiry',
          params: {
            jwt: 'token5',
            application: 'log-micro-service'
          }
        }, jasmine.any(Function));
      });

      it('should call microservice client #send 2 times with correct arguments', function () {
        q.microServiceRouter(messageObj, handleResponse);

        destinations.forEach(function (destination) {
          /*jshint camelcase: false */
          var microService = q.u_services.byDestination[destination];
          /*jshint camelcase: true */

          expect(microService.client.send).toHaveBeenCalledWith({
            application: microService.application,
            type: 'restRequest',
            path: '/api/users',
            pathTemplate: '/path/template',
            method: 'POST',
            headers: {
              'x-foo': 'bar'
            },
            params: {
              type: 'foo'
            },
            query: {
              bar: 'baz'
            },
            body: {
              login: 'johndoe',
              password: 'secret'
            },
            ip: '127.0.0.1',
            ips: ['client'],
            token: 'updated-jwt-token',
            args: {},
            jwt: true
          }, jasmine.any(Function));
        });
      });

      it('should call handleResponse with composite result', function () {
        /*jshint camelcase: false */
        var expected = {
          type: 'hello',
          message: {
            results: {
              sms_service: {
                application: 'sms-micro-service'
              },
              log_service: {
                application: 'log-micro-service',
              }
            },
            token: 'updated-jwt-token'
          }
        };
        /*jshint camelcase: true */

        destinations.forEach(function (destination) {
          /*jshint camelcase: false */
          var microService = q.u_services.byDestination[destination];
          /*jshint camelcase: true */

          microService.client.send.and.callFake(function (message, cb) {
            var responseObj = {
              message: {
                application: message.application,
                token: message.token
              },
              type: message.application + '-type',
              finished: true
            };
            cb(responseObj);
          });
        });

        q.microServiceRouter(messageObj, handleResponse);

        expect(handleResponse).toHaveBeenCalledWith(expected);
      });
    },

    whenRouteByPassJwtCheckEnabled: function () {
      beforeEach(function (done) {
        boot(function (_q, _messageObj, _handleResponse) {
          q = _q;
          messageObj = _messageObj;
          handleResponse = _handleResponse;

          done();
        });
      });

      it('should call handleMessage 2 times with correct arguments', function () {
        q.microServiceRouter(messageObj, handleResponse);

        expect(q.handleMessage).toHaveBeenCalledTimes(2);
        expect(q.handleMessage.calls.argsFor(0)[0]).toEqual({
          type: 'ewd-jwt-updateExpiry',
          params: {
            jwt: 'jwt-token',
            application: 'sms-micro-service'
          }
        }, jasmine.any(Function));
        expect(q.handleMessage.calls.argsFor(1)[0]).toEqual({
          type: 'ewd-jwt-updateExpiry',
          params: {
            jwt: 'jwt-token',
            application: 'log-micro-service'
          }
        }, jasmine.any(Function));
      });

      it('should call microservice client #send 2 times with correct arguments', function () {
        q.microServiceRouter(messageObj, handleResponse);

        destinations.forEach(function (destination) {
          /*jshint camelcase: false */
          var microService = q.u_services.byDestination[destination];
          /*jshint camelcase: true */

          expect(microService.client.send).toHaveBeenCalledWith({
            application: microService.application,
            type: 'restRequest',
            path: '/api/users',
            pathTemplate: '/path/template',
            method: 'POST',
            headers: {
              'x-foo': 'bar'
            },
            params: {
              type: 'foo'
            },
            query: {
              bar: 'baz'
            },
            body: {
              login: 'johndoe',
              password: 'secret'
            },
            ip: '127.0.0.1',
            ips: ['client'],
            token: 'updated-jwt-token',
            args: {},
            jwt: true
          }, jasmine.any(Function));
        });
      });

      it('should call handleResponse with composite result', function () {
        /*jshint camelcase: false */
        var expected = {
          type: 'hello',
          message: {
            results: {
              sms_service: {
                application: 'sms-micro-service'
              },
              log_service: {
                application: 'log-micro-service',
              }
            },
            token: 'updated-jwt-token'
          }
        };
        /*jshint camelcase: true */

        destinations.forEach(function (destination) {
          /*jshint camelcase: false */
          var microService = q.u_services.byDestination[destination];
          /*jshint camelcase: true */

          microService.client.send.and.callFake(function (message, cb) {
            var responseObj = {
              message: {
                application: message.application,
                token: message.token
              },
              type: message.application + '-type',
              finished: true
            };
            cb(responseObj);
          });
        });

        q.microServiceRouter(messageObj, handleResponse);

        expect(handleResponse).toHaveBeenCalledWith(expected);
      });
    },

    whenTokenReturned: function () {
      beforeEach(function (done) {
        boot(function (_q, _messageObj, _handleResponse) {
          q = _q;
          messageObj = _messageObj;
          handleResponse = _handleResponse;

          done();
        });
      });

      it('should call handleMessage 2 times with correct arguments', function () {
        q.handleMessage.and.callFake(function (msg, cb) {
          cb({
            message: {
              ok: false
            }
          });
        });

        q.microServiceRouter(messageObj, handleResponse);

        expect(q.handleMessage).toHaveBeenCalledTimes(2);

        [0, 1].forEach(function (n) {
          expect(q.handleMessage.calls.argsFor(n)[0]).toEqual({
            type: 'ewd-jwt-isValid',
            params: {
              jwt: 'jwt-token'
            }
          }, jasmine.any(Function));
        });
      });

      it('should call handleResponse with error', function () {
        q.handleMessage.and.callFake(function (msg, cb) {
          cb({
            message: {
              ok: false,
              error: 'Something wrong'
            }
          });
        });

        q.microServiceRouter(messageObj, handleResponse);

        destinations.forEach(function (destination) {
          /*jshint camelcase: false */
          var microService = q.u_services.byDestination[destination];
          /*jshint camelcase: true */

          expect(microService.client.send).not.toHaveBeenCalled();
        });

        expect(handleResponse).toHaveBeenCalledWith({
          type: 'hello',
          message: {
            error: 'Something wrong'
          }
        });
      });

      it('should call microservice client #send 2 times with correct arguments', function () {
        q.microServiceRouter(messageObj, handleResponse);

        destinations.forEach(function (destination) {
          /*jshint camelcase: false */
          var microService = q.u_services.byDestination[destination];
          /*jshint camelcase: true */

          expect(microService.client.send).toHaveBeenCalledWith({
            application: microService.application,
            type: 'restRequest',
            path: '/api/users',
            pathTemplate: '/path/template',
            method: 'POST',
            headers: {
              'x-foo': 'bar'
            },
            params: {
              type: 'foo'
            },
            query: {
              bar: 'baz'
            },
            body: {
              login: 'johndoe',
              password: 'secret'
            },
            ip: '127.0.0.1',
            ips: ['client'],
            token: 'updated-jwt-token',
            args: {},
            jwt: true
          }, jasmine.any(Function));
        });
      });

      it('should call handleResponse with composite result', function () {
        /*jshint camelcase: false */
        var expected = {
          type: 'hello',
          message: {
            results: {
              sms_service: {
                application: 'sms-micro-service'
              },
              log_service: {
                application: 'log-micro-service',
              }
            },
            token: 'updated-jwt-token'
          }
        };
        /*jshint camelcase: true */

        destinations.forEach(function (destination) {
          /*jshint camelcase: false */
          var microService = q.u_services.byDestination[destination];
          /*jshint camelcase: true */

          microService.client.send.and.callFake(function (message, cb) {
            var responseObj = {
              message: {
                application: message.application,
                token: message.token
              },
              type: message.application + '-type',
              finished: true
            };
            cb(responseObj);
          });
        });

        q.microServiceRouter(messageObj, handleResponse);

        expect(handleResponse).toHaveBeenCalledWith(expected);
      });
    },

    shouldHandleErrorResponse: function () {
      it('should call handleResponse with different errors', function () {
        /*jshint camelcase: false */
        var expected = {
          type: 'hello',
          message: {
            error: {
              destinations: {
                sms_service: {
                  error: 'sms-micro-service-error'
                },
                log_service: {
                  error: 'log-micro-service-error'
                }
              }
            }
          }
        };
        /*jshint camelcase: true */

        destinations.forEach(function (destination) {
          /*jshint camelcase: false */
          var microService = q.u_services.byDestination[destination];
          /*jshint camelcase: true */

          microService.client.send.and.callFake(function (message, cb) {
            var responseObj = {
              error: message.application + '-error',
              type: message.application + '-type',
              finished: true
            };
            cb(responseObj);
          });
        });

        q.microServiceRouter(messageObj, handleResponse);

        expect(handleResponse).toHaveBeenCalledWith(expected);
      });

      it('should call handleResponse with same error', function () {
        var expected = {
          type: 'hello',
          message: {
            error: 'same-error'
          }
        };

        destinations.forEach(function (destination) {
          /*jshint camelcase: false */
          var microService = q.u_services.byDestination[destination];
          /*jshint camelcase: true */

          microService.client.send.and.callFake(function (message, cb) {
            var responseObj = {
              message: {
                error: 'same-error'
              },
              type: message.application + '-type',
              finished: true
            };
            cb(responseObj);
          });
        });

        q.microServiceRouter(messageObj, handleResponse);

        expect(handleResponse).toHaveBeenCalledWith(expected);
      });
    },

    shouldCallRouteOnResponse: function (route) {
      /*jshint camelcase: false */
      var expectedObj = {
        type: 'hello',
        message: {
          results: {
            sms_service: {
              application: 'sms-micro-service'
            },
            log_service: {
              application: 'log-micro-service'
            }
          },
          token: 'updated-jwt-token'
        }
      };
      /*jshint camelcase: true */

      beforeEach(function (done) {
        boot(function (_q, _messageObj, _handleResponse) {
          q = _q;
          messageObj = _messageObj;
          handleResponse = _handleResponse;

          done();
        });
      });

      describe('And onResponse defined', function () {
        var onResponse;

        beforeEach(function () {
          onResponse = jasmine.createSpy();

          q.jwt.handlers.getRestJWT.and.returnValue('');
          q.router.hasRoute.and.returnValue({
            matched: route.matched,
            args: route.args,
            destination: route.destination,
            pathTemplate: route.pathTemplate,
            onResponse: onResponse
          });

          destinations.forEach(function (destination) {
            /*jshint camelcase: false */
            var microService = q.u_services.byDestination[destination];
            /*jshint camelcase: true */

            microService.client.send.and.callFake(function (message, cb) {
              var responseObj = {
                message: {
                  application: message.application,
                  token: message.token
                },
                finished: true
              };
              cb(responseObj);
            });
          });
        });

        it('should call route.onResponse with correct arguments', function () {
          q.microServiceRouter(messageObj, handleResponse);

          expect(onResponse).toHaveBeenCalledWithContext(q, {
            message: messageObj,
            destination: 'logout_service',
            responseObj: expectedObj,
            handleResponse: handleResponse,
            send: jasmine.any(Function)
          });
        });

        describe('and not handled', function () {
          it('should call handleResponse with response object', function () {
            q.microServiceRouter(messageObj, handleResponse);

            expect(handleResponse).toHaveBeenCalledWith(expectedObj);
          });
        });

        describe('and not handled', function () {
          it('should not call handleResponse', function () {
            onResponse.and.returnValue(true);

            q.microServiceRouter(messageObj, handleResponse);

            expect(handleResponse).not.toHaveBeenCalled();
          });
        });
      });
    }
  };
};
