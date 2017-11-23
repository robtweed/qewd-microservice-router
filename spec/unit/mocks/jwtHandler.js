'use strict';

module.exports = {
  mock: function () {
    return {
      getRestJWT: jasmine.createSpy(),
      isJWTValid: jasmine.createSpy()
    };
  }
};
