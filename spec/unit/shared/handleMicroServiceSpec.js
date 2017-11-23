'use strict';

module.exports = function (boot, route, type) {
  var destinationsSpec = require('./destinations')(boot, type);

  describe('And ' + type + ' destination', function () {
    var q;
    var messageObj;
    var handleResponse;

    beforeEach(function (done) {
      boot(function (_q, _messageObj, _handleResponse) {
        q = _q;
        messageObj = _messageObj;
        handleResponse = _handleResponse;

        q.router.hasRoute.and.returnValue(route);
        q.handleMessage.and.callFake(function (msg, cb) {
          cb({
            message: {
              ok: true,
              jwt: 'updated-jwt-token'
            }
          });
        });

        done();
      });
    });

    it('should call getRestJWT with correct arguments', function () {
      q.microServiceRouter(messageObj, handleResponse);

      expect(q.jwt.handlers.getRestJWT).toHaveBeenCalledWith(messageObj);
    });

    describe('And getRestJWT returns empty token', function () {
      beforeEach(function () {
        q.jwt.handlers.getRestJWT.and.returnValue('');
      });

      destinationsSpec.whenNoTokenReturned();
    });

    describe('And getRestJWT returns non empty token', function () {
      beforeEach(function () {
        q.jwt.handlers.getRestJWT.and.returnValue('jwt-token');
      });

      destinationsSpec.whenTokenReturned();
    });

    destinationsSpec.shouldHandleErrorResponse();

    destinationsSpec.shouldCallRouteOnResponse(route);
  });
};
