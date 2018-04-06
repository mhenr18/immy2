
Immy is targeted at Node 6.5.x and newer, which allows most recent language
features to be used. The use of ES2015 modules (which Node 6.5.x does not
support) is enabled by using Webpack to bundle the package's code together.

Immy has no dependencies, so it's fine to use in browsers.

Note however that the bundled code is not minified, nor is it transpiled
into ES5. If you want to use Immy in browsers that only support ES5, you will
need to handle this transpilation yourself.

To support tree-shaking, the unbundled ES2015 code is also included in the
package. Recent Webpack versions should support this without any extra
configuration.
