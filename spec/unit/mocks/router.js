'use strict';

module.exports = {
  mock: function () {
    return {
      hasRoute: jasmine.createSpy()
    };
  }
};
