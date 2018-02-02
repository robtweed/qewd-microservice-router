'use strict';

module.exports = function (boot) {
  var q;
  var messageObj;
  var handleResponse;
  var destination = 'login_service';

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

      it('should call handleMessage with correct arguments', function () {
        q.microServiceRouter(messageObj, handleResponse);

        expect(q.handleMessage).toHaveBeenCalledTimes(1);
        expect(q.handleMessage).toHaveBeenCalledWith({
          type: 'ewd-jwt-updateExpiry',
          params: {
            jwt: 'token1',
            application: 'login-micro-service'
          }
        }, jasmine.any(Function));
      });

      it('should call microservice client #send with correct arguments', function () {
        /*jshint camelcase: false */
        var microService = q.u_services.byDestination[destination];
        /*jshint camelcase: true */

        q.microServiceRouter(messageObj, handleResponse);

        expect(microService.client.send).toHaveBeenCalledTimes(1);
        expect(microService.client.send).toHaveBeenCalledWith({
          application: 'login-micro-service',
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

      it('should call handleResponse', function () {
        var responseObj = {
          foo: 'bar'
        };

        /*jshint camelcase: false */
        var microService = q.u_services.byDestination[destination];
        /*jshint camelcase: true */

        microService.client.send.and.callFake(function (message, cb) {
          cb(responseObj);
        });

        q.microServiceRouter(messageObj, handleResponse);

        expect(handleResponse).toHaveBeenCalledWith(responseObj);
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

      it('should call handleMessage with correct arguments', function () {
        q.microServiceRouter(messageObj, handleResponse);

        expect(q.handleMessage).toHaveBeenCalledTimes(1);
        expect(q.handleMessage).toHaveBeenCalledWith({
          type: 'ewd-jwt-updateExpiry',
          params: {
            jwt: 'token1',
            application: 'login-micro-service'
          }
        }, jasmine.any(Function));
      });

      it('should call microservice client #send with correct arguments', function () {
        /*jshint camelcase: false */
        var microService = q.u_services.byDestination[destination];
        /*jshint camelcase: true */

        q.microServiceRouter(messageObj, handleResponse);

        expect(microService.client.send).toHaveBeenCalledTimes(1);
        expect(microService.client.send).toHaveBeenCalledWith({
          application: 'login-micro-service',
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

      it('should call handleResponse', function () {
        var responseObj = {
          foo: 'bar'
        };

        /*jshint camelcase: false */
        var microService = q.u_services.byDestination[destination];
        /*jshint camelcase: true */

        microService.client.send.and.callFake(function (message, cb) {
          cb(responseObj);
        });

        q.microServiceRouter(messageObj, handleResponse);

        expect(handleResponse).toHaveBeenCalledWith(responseObj);
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

      it('should call handleMessage with correct arguments', function () {
        q.microServiceRouter(messageObj, handleResponse);

        expect(q.handleMessage).toHaveBeenCalledTimes(1);
        expect(q.handleMessage).toHaveBeenCalledWith({
          type: 'ewd-jwt-updateExpiry',
          params: {
            jwt: 'jwt-token',
            application: 'login-micro-service'
          }
        }, jasmine.any(Function));
      });

      it('should call microservice client #send with correct arguments', function () {
        /*jshint camelcase: false */
        var microService = q.u_services.byDestination[destination];
        /*jshint camelcase: true */

        q.microServiceRouter(messageObj, handleResponse);

        expect(microService.client.send).toHaveBeenCalledTimes(1);
        expect(microService.client.send).toHaveBeenCalledWith({
          application: 'login-micro-service',
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

      it('should call handleResponse', function () {
        var responseObj = {
          foo: 'bar'
        };

        /*jshint camelcase: false */
        var microService = q.u_services.byDestination[destination];
        /*jshint camelcase: true */

        microService.client.send.and.callFake(function (message, cb) {
          cb(responseObj);
        });

        q.microServiceRouter(messageObj, handleResponse);

        expect(handleResponse).toHaveBeenCalledWith(responseObj);
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

      it('should call handleMessage with correct arguments', function () {
        q.handleMessage.and.callFake(function (msg, cb) {
          cb({
            message: {
              ok: false
            }
          });
        });

        q.microServiceRouter(messageObj, handleResponse);

        expect(q.handleMessage.calls.count()).toBe(1);
        expect(q.handleMessage).toHaveBeenCalledWith({
          type: 'ewd-jwt-isValid',
          params: {
            jwt: 'jwt-token'
          }
        }, jasmine.any(Function));
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

        /*jshint camelcase: false */
        var microService = q.u_services.byDestination[destination];
        /*jshint camelcase: true */

        q.microServiceRouter(messageObj, handleResponse);

        expect(microService.client.send).not.toHaveBeenCalled();
        expect(handleResponse).toHaveBeenCalledWith({
           message: {
            error: 'Something wrong'
          }
        });
      });

      it('should call microservice client #send with correct arguments', function () {
        /*jshint camelcase: false */
        var microService = q.u_services.byDestination[destination];
        /*jshint camelcase: true */

        q.microServiceRouter(messageObj, handleResponse);

        expect(microService.client.send).toHaveBeenCalledWith({
          application: 'login-micro-service',
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

      it('should call handleResponse', function () {
        var responseObj = {
          foo: 'bar'
        };

        /*jshint camelcase: false */
        var microService = q.u_services.byDestination[destination];
        /*jshint camelcase: true */

        microService.client.send.and.callFake(function (message, cb) {
          cb(responseObj);
        });

        q.microServiceRouter(messageObj, handleResponse);

        expect(handleResponse).toHaveBeenCalledWith(responseObj);
      });
    },

    shouldHandleErrorResponse: function () {
      it('should call handleResponse with error', function () {
        var expected = {
          message: {
            error: 'login-micro-service-error'
          }
        };

        /*jshint camelcase: false */
        var microService = q.u_services.byDestination[destination];
        /*jshint camelcase: true */

        microService.client.send.and.callFake(function (message, cb) {
          var responseObj = {
            error: message.application + '-error'
          };
          cb(responseObj);
        });

        q.microServiceRouter(messageObj, handleResponse);

        expect(handleResponse).toHaveBeenCalledWith(expected);
      });
    },

    shouldCallRouteOnResponse: function (route) {
      var responseObj = {
        foo: 'bar'
      };

      beforeEach(function (done) {
        boot(function (_q, _messageObj, _handleResponse) {
          q = _q;
          messageObj = _messageObj;
          handleResponse = _handleResponse;

          done();
        });
      });

      describe('and onResponse defined', function () {
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

          /*jshint camelcase: false */
          var microService = q.u_services.byDestination[destination];
          /*jshint camelcase: false */

          microService.client.send.and.callFake(function (message, cb) {
            cb(responseObj);
          });
        });

        it('should call route.onResponse with correct arguments', function () {
          q.microServiceRouter(messageObj, handleResponse);

          expect(onResponse).toHaveBeenCalledWithContext(q, {
            message: messageObj,
            destination: 'login_service',
            responseObj: responseObj,
            handleResponse: handleResponse,
            send: jasmine.any(Function)
          });
        });

        describe('and not handled', function () {
          it('should call handleResponse with response object', function () {
            q.microServiceRouter(messageObj, handleResponse);

            expect(handleResponse).toHaveBeenCalledWith(responseObj);
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

