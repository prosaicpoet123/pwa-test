/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-disable import/no-commonjs */
/* eslint-env node */

const webpack = require('webpack')
const path = require('path')
const baseCommon = require('./base.common')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

const webPackageJson = require('../package.json')   // eslint-disable-line import/no-extraneous-dependencies

const analyzeBundle = process.env.MOBIFY_ANALYZE === 'true'

const ssrParameters = webPackageJson.mobify && webPackageJson.mobify.ssrParameters

// For more information on these settings, see https://webpack.js.org/configuration
const config = {
    // Create a source map for all files
    devtool: 'source-map',
    // Tell webpack where to look to start building the bundle
    entry: './app/main.jsx',
    output: {
        path: path.resolve(process.cwd(), 'build'),
        filename: '[name].js',
        // A chunk is a JS file that is split out by webpack and loaded async
        // The chunks are named using a comment when we asychronously import them
        // See app/containers/templates.jsx
        chunkFilename: '[name].js'
    },
    // Tell webpack how to find specific modules
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
        alias: {
            'babel-runtime': path.resolve(process.cwd(), 'node_modules', 'babel-runtime'),
            lodash: path.resolve(process.cwd(), 'node_modules', 'lodash'),
            'lodash._basefor': path.resolve(process.cwd(), 'node_modules', 'lodash', '_baseFor'),
            'lodash.escaperegexp': path.resolve(process.cwd(), 'node_modules', 'lodash', 'escapeRegExp'),
            'lodash.frompairs': path.resolve(process.cwd(), 'node_modules', 'lodash', 'fromPairs'),
            'lodash.isarray': path.resolve(process.cwd(), 'node_modules', 'lodash', 'isArray'),
            'lodash.isarguments': path.resolve(process.cwd(), 'node_modules', 'lodash', 'isArguments'),
            'lodash.intersection': path.resolve(process.cwd(), 'node_modules', 'lodash', 'intersection'),
            'lodash.isplainobject': path.resolve(process.cwd(), 'node_modules', 'lodash', 'isPlainObject'),
            'lodash.keys': path.resolve(process.cwd(), 'node_modules', 'lodash', 'keys'),
            'lodash.keysin': path.resolve(process.cwd(), 'node_modules', 'lodash', 'keysIn'),
            'lodash.mapvalues': path.resolve(process.cwd(), 'node_modules', 'lodash', 'mapValues'),
            'lodash.throttle': path.resolve(process.cwd(), 'node_modules', 'lodash', 'throttle'),
            react: path.resolve(process.cwd(), 'node_modules', 'react')
        }
    },
    // Manually split all of our node_modules into the file vendor.js
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'initial'
                }
            }
        }
    },
    plugins: [
        // Include all of the shared plugins
        ...baseCommon.plugins,
        new ExtractTextPlugin({
            filename: '[name].css'
        }),
        // Move the static files to the root
        // so that we can import them from the bundle
        new CopyPlugin([
            {from: 'app/static/', to: 'static/'}
        ]),
        // Define compile time values that we need within the files
        new webpack.DefinePlugin({
            // This is defined as a boolean, not a string
            MESSAGING_ENABLED: `${webPackageJson.messagingEnabled}`,
            // These are defined as string constants
            PROJECT_SLUG: `'${webPackageJson.projectSlug}'`,
            AJS_SLUG: `'${webPackageJson.aJSSlug}'`,
            WEBPACK_MOBIFY_GA_ID: `'${webPackageJson.mobifyGAID}'`,
            WEBPACK_SSR_ENABLED: webPackageJson.mobify ? `${webPackageJson.mobify.ssrEnabled}` : 'false',
            WEBPACK_PROXY1_PATH: ssrParameters ? `'${ssrParameters.ssrProxy1Path}'` : "''", // eslint-disable-line quotes
            WEBPACK_PROXY2_PATH: ssrParameters ? `'${ssrParameters.ssrProxy2Path}'` : "''" // eslint-disable-line quotes
        })
    ],
    module: {
        rules: [
            // Run the project files through the babel-loader to transpile them from es6
            {
                test: /\.js(x?)$/,
                exclude: /node_modules(?!\/mobify-progressive-app-sdk)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: `${__dirname}/tmp`,
                        plugins: ['syntax-dynamic-import']
                    }
                }
            },
            // Provide a loader for SVG files
            {
                test: /\.svg$/,
                use: 'text-loader'
            }
        ],
    }
}

if (analyzeBundle) {
    console.info('Analyzing build...')
    config.plugins = config.plugins.concat([
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: true
        })
    ])
}

// Prepare entries for async loading:
// Webpack doesn't support async loading of the commons and entry bundles out of the box
// Replace `webpackJsonp` calls with `webpackJsonpAsync` and implement the latter in loader
// so that it waits for the vendor script to finish loading
// before running the webpackJsonp with the received arguments.
config.plugins.push(function() {
    this.plugin('after-compile', (compilation, callback) => {
        for (const file in compilation.assets) {
            if (/\.js$/.test(file) && !(/^vendor/.test(file))) {
                const src = compilation.assets[file]
                if (!src.children || !src.children[0]) {
                    src._value = src._value.replace(/^webpackJsonp\w*/, 'webpackJsonpAsync')
                } else {
                    src.children[0]._value = src.children[0]._value.replace(/^webpackJsonp\w*/, 'webpackJsonpAsync')
                }
            }
        }

        callback()
    })
})

module.exports = config
