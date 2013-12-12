var parser = require('../../lib/content-parsers/empty-div');

describe("content-parsers/empty-div", function() {
  it("should add newline inside empty divs", function() {
    expect(parser('<div class="xxx"></div>\n<div>aaa</div><div class="yy">\n\n</div>'))
      .toEqual('<div class="xxx">\n</div>\n<div>aaa</div><div class="yy">\n\n</div>');
  });
});