var _ = require('lodash');
var logger = require('winston');
var rewire = require('rewire');
var plugin = rewire('../../../lib/doc-processor/plugins/process-links');

describe("process-links doc-processor plugin", function() {
  var doc, links, logLevel;

  beforeEach(function() {
    logLevel = logger.level;
    logger.level = 'warn';
    spyOn(logger, 'warn');
    plugin.before();
    doc = {
      componentType: 'directive',
      module: 'ng',
      name: 'ngInclude',
      description: "Some text with a {@link some/url link} to somewhere",
      example: "Some example with a code link: {@link module:ngOther.directive:ngDirective}",
      goodLink: "A link to reachable code: {@link ngInclude}",
      section: 'src',
      file: 'some/file.js',
      startingLine: 200
    };
    plugin.each(doc);
    plugin.after([doc]);
    links = plugin.__get__('links');
  });

  afterEach(function() {
    logger.level = logLevel;
  });

  it("should convert url links to anchors", function() {
    expect(doc.description).toEqual('Some text with a <a href="some/url">link</a> to somewhere');
  });

  it("should convert code links to anchors with formatted code", function() {
    expect(doc.example).toEqual('Some example with a code link: <a href="/src/ngOther/directive/ngDirective"><code class="prettyprint linenum"><span class="title">ngDirective</span></code></a>');
    expect(doc.goodLink).toEqual('A link to reachable code: <a href="/src/ng/directive/ngInclude"><code class="prettyprint linenum"><span class="title">ngInclude</span></code></a>');
  });

  it("should collect the link in the links array", function() {
    expect(links).toEqual({
      'some/url': {
        doc: doc,
        url : 'some/url',
        title : 'link',
        type : 'url',
        anchorElement : '<a href="some/url">link</a>'
      },
      '/src/ngOther/directive/ngDirective': {
        doc: doc,
        url: '/src/ngOther/directive/ngDirective',
        title: '<code class="prettyprint linenum"><span class="title">ngDirective</span></code>',
        type: 'code',
        anchorElement: '<a href="/src/ngOther/directive/ngDirective"><code class="prettyprint linenum"><span class="title">ngDirective</span></code></a>'
      },
      '/src/ng/directive/ngInclude': {
        doc: doc,
        url: '/src/ng/directive/ngInclude',
        title: '<code class="prettyprint linenum"><span class="title">ngInclude</span></code>',
        type: 'code',
        anchorElement: '<a href="/src/ng/directive/ngInclude"><code class="prettyprint linenum"><span class="title">ngInclude</span></code></a>'
      }
    });
  });

  it("should check that any links in the links property of a doc reference a valid doc", function() {
    expect(logger.warn).toHaveBeenCalled();
    expect(logger.warn.calls[0].args).toEqual([
      'In doc "some/file.js" at line 200: Invalid link, "/src/ngOther/directive/ngDirective"'
    ]);
    expect(logger.warn.calls[1].args).toEqual([
      'In doc "some/file.js" at line 200: Invalid link, "/src/ng/directive/ngInclude"'
    ]);
  });
});