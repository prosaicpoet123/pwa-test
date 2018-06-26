/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-disable import/no-commonjs */
/* eslint-env node */

const webpack = require('webpack')
const path = require('path')
const baseCommon = require('./base.common')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const webPackageJson = require('../package.json') // eslint-disable-line import/no-extraneous-dependencies
const analyzeBundle = process.env.MOBIFY_ANALYZE === 'true'

const CWD = process.cwd()
const BUILD_DIR = path.resolve(CWD, 'build')

const isProduction = process.env.NODE_ENV === 'production'

const ssrParameters = webPackageJson.mobify && webPackageJson.mobify.ssrParameters


/**
 * This configuration is for the SSR server that can be run as a local
 * development server and as a remote server.
 */
const ssrServerConfig = {
    // We always want a source map, since it makes debugging issues
    // with the rendering server much easier.
    devtool: 'cheap-source-map',
    entry: './app/ssr.js',
    target: 'node',
    output: {
        path: BUILD_DIR,
        filename: 'ssr.js',
        libraryTarget: 'commonjs2'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    plugins: [
        new webpack.DefinePlugin({
            // This is a string
            WEBPACK_SITE_URL: `'${webPackageJson.siteUrl}'`,
            // These are defined as string constants
            PROJECT_SLUG: `'${webPackageJson.projectSlug}'`,
            DEBUG: !isProduction,
            WEBPACK_MOBIFY_GA_ID: `'${webPackageJson.mobifyGAID}'`,
            WEBPACK_PROXY1_HOST: ssrParameters ? `'${ssrParameters.ssrProxy1Host}'` : "''", // eslint-disable-line quotes
            WEBPACK_PROXY2_HOST: ssrParameters ? `'${ssrParameters.ssrProxy2Host}'` : "''", // eslint-disable-line quotes
            WEBPACK_PROXY1_PATH: ssrParameters ? `'${ssrParameters.ssrProxy1Path}'` : "''", // eslint-disable-line quotes
            WEBPACK_PROXY2_PATH: ssrParameters ? `'${ssrParameters.ssrProxy2Path}'` : "''" // eslint-disable-line quotes
        }),
        // Bundle everything into one server-side file. Dynamic
        // module loading isn't helpful in Lambda (it slows down
        // startup).
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        })
    ],
    module: {
        rules: [
            {
                test: /.*jsdom.*xmlhttprequest\.js$/,
                loader: require.resolve('./jsdom-fixup')
            },
            {
                test: /\.js(x?)$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    cacheDirectory: `${__dirname}/tmp`,
                    plugins: [
                        'syntax-dynamic-import'
                    ]
                }
            },
            {
                test: /\.svg$/,
                use: 'text-loader'
            }
        ],
    }
}

const ssrSWLoaderConfig = {
    devtool: 'cheap-source-map',
    entry: './service-worker-loader.js',
    output: {
        path: path.resolve(process.cwd(), 'build'),
        filename: 'service-worker-loader.js'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: `${__dirname}/tmp`
                    }
                }
            },
            {
                test: /\.css?$/,
                exclude: /node_modules/,
                use: 'postcss-loader',
            }
        ],
    },
    plugins: [
        new webpack.DefinePlugin({
            // This is a string
            WEBPACK_SITE_URL: `'${webPackageJson.siteUrl}'`,
            // This is defined as a boolean, not a string
            MESSAGING_ENABLED: `${webPackageJson.messagingEnabled}`,
            // These are defined as string constants
            MESSAGING_SITE_ID: `'${webPackageJson.messagingSiteId}'`,
            PROJECT_SLUG: `'${webPackageJson.projectSlug}'`,
            AJS_SLUG: `'${webPackageJson.aJSSlug}'`,
            DEBUG: !isProduction
        }),
        // Keep the output to a single chunk
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        })
    ]
}

const ssrLoaderConfig = {
    devtool: 'cheap-source-map',
    entry: {
        'ssr-loader': './app/ssr-loader.js',
        'core-polyfill': 'core-js',
        'fetch-polyfill': 'whatwg-fetch'
    },
    output: {
        path: path.resolve(process.cwd(), 'build'),
        filename: '[name].js'
    },
    resolve: {
        extensions: ['.js', '.jsx', '.json']
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: `${__dirname}/tmp`
                    }
                }
            },
            {
                test: /\.css?$/,
                exclude: /node_modules/,
                use: 'postcss-loader',
            }
        ],
    },
    plugins: [
        new webpack.LoaderOptionsPlugin({
            options: {
                postcss: baseCommon.postcss
            }
        }),
        new webpack.DefinePlugin({
            // This is a string
            WEBPACK_SITE_URL: `'${webPackageJson.siteUrl}'`,
            // This is defined as a boolean, not a string
            MESSAGING_ENABLED: `${webPackageJson.messagingEnabled}`,
            // These are defined as string constants
            MESSAGING_SITE_ID: `'${webPackageJson.messagingSiteId}'`,
            PROJECT_SLUG: `'${webPackageJson.projectSlug}'`,
            AJS_SLUG: `'${webPackageJson.aJSSlug}'`,
            DEBUG: !isProduction,
            SITE_NAME: `"${webPackageJson.siteName}"`
        }),
        // Keep the ssr-loader in a single chunk
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1
        })
    ]
}

const configs = [ssrServerConfig, ssrLoaderConfig, ssrSWLoaderConfig]

if (analyzeBundle) {
    console.info('Analyzing build...')
    configs.forEach(
        (config) => {
            config.plugins = config.plugins.concat([
                new BundleAnalyzerPlugin({
                    analyzerMode: 'static',
                    openAnalyzer: true
                })
            ])
        }
    )
}

module.exports = configs
