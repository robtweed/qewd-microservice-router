'use strict';

var events = require('events');
var mockRouter = require('./mocks/router');
var mockJwtHandler = require('./mocks/jwtHandler');
var microServiceRouter = require('../lib/microServiceRouter');
var handleMicroServiceSpec = require('./shared/handleMicroServiceSpec');

describe('unit/microServiceRouter:', function () {
  var MasterProcess;
  var q;
  var messageObj;
  var handleResponse;

  var boot = function (cb) {
    cb(q, messageObj, handleResponse);
  };

  beforeAll(function () {
    MasterProcess = function () {
      this.microServiceRouter = microServiceRouter;

      events.EventEmitter.call(this);
    };

    MasterProcess.prototype = Object.create(events.EventEmitter.prototype);
    MasterProcess.prototype.constructor = MasterProcess;
  });

  beforeEach(function () {
    q = new MasterProcess();
    q.handleMessage = jasmine.createSpy();
    q.router = mockRouter.mock();

    q.jwt = {
      handlers: mockJwtHandler.mock()
    };

    /*jshint camelcase: false */
    q.u_services = require('./fixtures/servicesConfig');
    Object.keys(q.u_services.byDestination).forEach(function (destination) {
      q.u_services.byDestination[destination].client.send = jasmine.createSpy();
    });
    /*jshint camelcase: true */
  });

  beforeEach(function () {
    messageObj = {
      type: 'hello',
      path: '/api/users',
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
      ips: ['client']
    };
    handleResponse = jasmine.createSpy();
  });

  afterEach(function () {
    q.removeAllListeners();
    q = null;
  });

  it('should call #router.hasRoute with correct arguments', function () {
    q.router.hasRoute.and.returnValue({});

    q.microServiceRouter(messageObj, handleResponse);

    expect(q.router.hasRoute).toHaveBeenCalledWith('/api/users', 'POST', []);
  });

  describe('When not matched', function () {
    it('should return false', function () {
      var route = {
        matched: false
      };

      q.router.hasRoute.and.returnValue(route);

      var actual = q.microServiceRouter(messageObj, handleResponse);

      expect(actual).toBeFalsy();
    });
  });

  describe('When matched', function () {
    describe('and onRequest defined', function () {
      var onRequest;

      beforeEach(function () {
        onRequest = jasmine.createSpy();

        q.jwt.handlers.getRestJWT.and.returnValue('jwt-token');
        q.router.hasRoute.and.returnValue({
          matched: true,
          args: {
            foo: 'bar',
            bar: 'baz'
          },
          destination: 'login_service',
          pathTemplate: '/path/template',
          onRequest: onRequest
        });
      });

      it('should call getRestJWT with correct arguments', function () {
        q.microServiceRouter(messageObj, handleResponse);

        expect(q.jwt.handlers.getRestJWT).toHaveBeenCalledWith(messageObj);
      });

      it('should call route.onRequest with correct arguments', function () {
        var expectedArgs = {
          req: {
            type: 'hello',
            path: '/api/users',
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
            ips: [ 'client' ],
            pathTemplate: '/path/template'
          },
          foo: 'bar',
          bar: 'baz',
          jwt: 'jwt-token'
        };

        var actual = q.microServiceRouter(messageObj, handleResponse);

        expect(actual).toBeTruthy();
        expect(onRequest).toHaveBeenCalledWithContext(q, expectedArgs, jasmine.any(Function), handleResponse);
      });
    });

    describe('And have no destination', function () {
      it('should return false', function () {
        var route = {
          matched: true,
          args: {}
        };

        q.router.hasRoute.and.returnValue(route);

        var actual = q.microServiceRouter(messageObj, handleResponse);

        expect(actual).toBeFalsy();
      });
    });

    describe('And no such destination', function () {
      it('should return true and call handleResponse with error message', function () {
        var route = {
          matched: true,
          args: {},
          destination: 'non_existing_service'
        };

        q.router.hasRoute.and.returnValue(route);

        var actual = q.microServiceRouter(messageObj, handleResponse);

        expect(actual).toBeTruthy();
        expect(handleResponse).toHaveBeenCalledWith({
          message: {
            error: 'No such destination: non_existing_service'
          }
        });
      });
    });

    describe('And micro service incorrectly defined for destination', function () {
      it('should return true and call handleResponse with error message', function () {
        /*jshint camelcase: false */
        var microService = q.u_services.byDestination.login_service;
        /*jshint camelcase: true */

        var route = {
          matched: true,
          args: {},
          destination: 'login_service'
        };

        delete microService.client.send;
        q.router.hasRoute.and.returnValue(route);

        var actual = q.microServiceRouter(messageObj, handleResponse);

        expect(actual).toBeTruthy();
        expect(handleResponse).toHaveBeenCalledWith({
          message: {
            error: 'MicroService incorrectly defined for destination: login_service'
          }
        });
      });
    });

    handleMicroServiceSpec(boot, {
      matched: true,
      args: {},
      destination: 'login_service',
      pathTemplate: '/path/template'
    }, 'single');

    handleMicroServiceSpec(boot, {
      matched: true,
      args: {},
      destination: 'logout_service',
      pathTemplate: '/path/template'
    }, 'multiple');
  });
});
