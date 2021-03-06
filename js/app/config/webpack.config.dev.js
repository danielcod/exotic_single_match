// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end

var autoprefixer = require('autoprefixer');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var I18nPlugin = require('i18n-webpack-plugin');
var CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
var InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
var WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
var getClientEnvironment = require('./env');
var path = require('path');
var paths = require('./paths');

var languages = {
  en: null,
};

// @remove-on-eject-begin
// `path` is not used after eject - see https://github.com/facebookincubator/create-react-app/issues/1174
// var path = require('path');
// @remove-on-eject-end

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
var publicPath = '/';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
var publicUrl = '';
// Get environment variables to inject into our app.
var env = getClientEnvironment(publicUrl);

const NODE_ENV = /development|production/ig.test(process.env.NODE_ENV)
  ? process.env.NODE_ENV.toLowerCase()
  : 'development';
const AUTOPREFIXER_BROWSERS = ['last 2 versions', 'not ie < 11', 'safari >= 4'];

if (!process.env.PWD) {
    process.env.PWD = process.cwd();
}

const PWD = process.env.PWD;

const DEBUG = NODE_ENV === 'development';

const CSS_LOADER_OPTIONS = {
  sourceMap: DEBUG,
  minimize: !DEBUG, // CSS Nano http://cssnano.co/options/
};
const CSS_LOADER_MODULES_OPTIONS = {
  sourceMap: DEBUG,
  // CSS Modules https://github.com/css-modules/css-modules
  modules: true,
  localIdentName: DEBUG ? '[name]_[local]' : '[hash:base64:4]', // _[hash:base64:3]
  // CSS Nano http://cssnano.co/options/
  minimize: !DEBUG,
};
const POSTCSS_LOADER_OPTIONS = {
  parser: 'postcss-scss',
  plugins: () => [
    require('autoprefixer')({
      browsers: AUTOPREFIXER_BROWSERS,
    }),
  ],
};
const SASS_LOADER_OPTIONS = {
  sourceMap: DEBUG,
  includePaths: [path.resolve(PWD, './src')],
};

// This is the development configuration.
// It is focused on developer experience and fast rebuilds.
// The production configuration is different and lives in a separate file.
module.exports = Object.keys(languages).map(function(language) {
  return {
    // You may want 'eval' instead if you prefer to see the compiled output in DevTools.
    // See the discussion in https://github.com/facebookincubator/create-react-app/issues/343.
    devtool: 'cheap-module-source-map',
    // These are the "entry points" to our application.
    // This means they will be the "root" imports that are included in JS bundle.
    // The first two entry points enable "hot" CSS and auto-refreshes for JS.
    entry: [
      // Include an alternative client for WebpackDevServer. A client's job is to
      // connect to WebpackDevServer by a socket and get notified about changes.
      // When you save a file, the client will either apply hot updates (in case
      // of CSS changes), or refresh the page (in case of JS changes). When you
      // make a syntax error, this client will display a syntax error overlay.
      // Note: instead of the default WebpackDevServer client, we use a custom one
      // to bring better experience for Create React App users. You can replace
      // the line below with these two lines if you prefer the stock client:
      require.resolve('webpack-dev-server/client') + '?/',
      require.resolve('webpack/hot/dev-server'),
      // require.resolve('react-dev-utils/webpackHotDevClient'),
      // We ship a few polyfills by default:
      require.resolve('./polyfills'),
      // Finally, this is your app's code:
      paths.appIndexJs,
      // We include the app code last so that if there is a runtime error during
      // initialization, it doesn't blow up the WebpackDevServer client, and
      // changing JS code would still trigger a refresh.
    ],
    output: {
      // Next line is not used in dev but WebpackDevServer crashes without it:
      path: paths.appBuild,
      // Add /* filename */ comments to generated require()s in the output.
      pathinfo: true,
      // This does not produce a real file. It's just the virtual path that is
      // served by WebpackDevServer in development. This is the JS bundle
      // containing code from all our entry points, and the Webpack runtime.
      filename: `static/js/${language}_bundle.js`,
      // This is the URL that app is served from. We use "/" in development.
      publicPath: publicPath,
    },
    resolve: {
      // This allows you to set a fallback for where Webpack should look for modules.
      // We read `NODE_PATH` environment variable in `paths.js` and pass paths here.
      // We placed these paths second because we want `node_modules` to "win"
      // if there are any conflicts. This matches Node resolution mechanism.
      // https://github.com/facebookincubator/create-react-app/issues/253
      modules: ['node_modules'].concat(paths.nodePaths),
      // These are the reasonable defaults supported by the Node ecosystem.
      // We also include JSX as a common component filename extension to support
      // some tools, although we do not recommend using it, see:
      // https://github.com/facebookincubator/create-react-app/issues/290
      extensions: ['.js', '.json', '.jsx'],
      alias: {
        // Support React Native Web
        // https://www.smashingmagazine.com/2016/08/a-glimpse-into-the-future-with-react-native-for-web/
        'react-native': 'react-native-web',
      },
    },
    // @remove-on-eject-begin
    // Resolve loaders (webpack plugins for CSS, images, transpilation) from the
    // directory of `react-scripts` itself rather than the project directory.
    resolveLoader: {
      modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    },
    // @remove-on-eject-end
    module: {
      rules: [
        // First, run the linter.
        // It's important to do this before Babel processes the JS.
        {
          test: /\.(js|jsx)$/,
          enforce: 'pre',
          use: [
            {
              // @remove-on-eject-begin
              // Point ESLint to our predefined config.

              // @remove-on-eject-end
              loader: 'eslint-loader',
            },
          ],
          include: paths.appSrc,
        },
        // ** ADDING/UPDATING LOADERS **
        // The "url" loader handles all assets unless explicitly excluded.
        // The `exclude` list *must* be updated with every change to loader extensions.
        // When adding a new loader, you must add its `test`
        // as a new entry in the `exclude` list for "url" loader.

        // "url" loader embeds assets smaller than specified size as data URLs to avoid requests.
        // Otherwise, it acts like the "file" loader.
        {
          exclude: [
            /\.html$/,
            /\.(js|jsx)$/,
            /\.css$/,
            /\.json$/,
            /\.svg$/,
            /\.scss$/,
            /\.mod\.scss$/,
          ],
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: 'static/media/[name].[hash:8].[ext]',
          },
        },
        // Process JS with Babel.
        {
          test: /\.(js|jsx)$/,
          include: paths.appSrc,
          loader: 'babel-loader',
          options: {
            // @remove-on-eject-begin
            babelrc: false,
            presets: [require.resolve('babel-preset-react-app')],
            // @remove-on-eject-end
            // This is a feature of `babel-loader` for webpack (not Babel itself).
            // It enables caching results in ./node_modules/.cache/babel-loader/
            // directory for faster rebuilds.
            cacheDirectory: true,
          },
        },
        // "postcss" loader applies autoprefixer to our CSS.
        // "css" loader resolves paths in CSS and adds assets as dependencies.
        // "style" loader turns CSS into JS modules that inject <style> tags.
        // In production, we use a plugin to extract that CSS to a file, but
        // in development "style" loader enables hot editing of CSS.
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss', // https://webpack.js.org/guides/migrating/#complex-options
                plugins: function() {
                  return [
                    autoprefixer({
                      browsers: [
                        '>1%',
                        'last 4 versions',
                        'Firefox ESR',
                        'not ie < 9', // React doesn't support IE8 anyway
                      ],
                    }),
                  ];
                },
              },
            },
          ],
        },
        {
          test: /\.scss$/,
          exclude: [/node_modules/, /\.mod\.scss$/],
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: CSS_LOADER_OPTIONS,
            },
            {
              loader: 'postcss-loader',
              options: POSTCSS_LOADER_OPTIONS,
            },
            {
              loader: 'sass-loader',
              options: SASS_LOADER_OPTIONS,
            },
          ],
        },
        {
          test: /\.mod.scss$/,
          use: [
            'isomorphic-style-loader',
            {
              loader: 'css-loader',
              options: CSS_LOADER_MODULES_OPTIONS,
            },
            {
              loader: 'postcss-loader',
              options: POSTCSS_LOADER_OPTIONS,
            },
            {
              loader: 'sass-loader',
              options: SASS_LOADER_OPTIONS,
            },
          ],
        },
        // "file" loader for svg
        {
          test: /\.svg$/,
          use: [
            {
              loader: 'svg-sprite-loader',
              options: {
                name: '[name]_[hash]',
                prefixize: true,
              },
            },
          ],
        },
        // ** STOP ** Are you adding a new loader?
        // Remember to add the new extension(s) to the "url" loader exclusion list.
      ],
    },
    plugins: [
      // Makes some environment variables available in index.html.
      // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
      // <link rel="shortcut icon" href="%PUBLIC_URL%/favicon.ico">
      // In development, this will be an empty string.
      new InterpolateHtmlPlugin(env.raw),
      // Generates an `index.html` file with the <script> injected.
      new HtmlWebpackPlugin({
        inject: true,
        template: paths.appHtml,
      }),
      // Makes some environment variables available to the JS code, for example:
      // if (process.env.NODE_ENV === 'development') { ... }. See `./env.js`.
      new webpack.DefinePlugin(env.stringified),
      // This is necessary to emit hot updates (currently CSS only):
      new webpack.HotModuleReplacementPlugin(),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      // See https://github.com/facebookincubator/create-react-app/issues/240
      new CaseSensitivePathsPlugin(),
      // If you require a missing module and then `npm install` it, you still have
      // to restart the development server for Webpack to discover it. This plugin
      // makes the discovery automatic so you don't have to restart.
      // See https://github.com/facebookincubator/create-react-app/issues/186
      new WatchMissingNodeModulesPlugin(paths.appNodeModules),

      new I18nPlugin(languages[language]),
    ],
    // Some libraries import Node modules but don't use them in the browser.
    // Tell Webpack to provide empty mocks for them so importing them works.
    node: {
      fs: 'empty',
      net: 'empty',
      tls: 'empty',
    },
    // Turn off performance hints during development because we don't do any
    // splitting or minification in interest of speed. These warnings become
    // cumbersome.
    performance: {
      hints: false,
    },
  };
});
