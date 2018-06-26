/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-disable import/no-commonjs */

const webpack = require('webpack')
const ip = require('ip')

const loaderConfig = require('./base.loader')
const mainConfig = require('./base.main')
const workerConfig = require('./base.worker')
const nonPWAConfig = require('./base.non-pwa')
const ssrConfigs = require('./base.ssr')
const translationsConfig = require('./base.translations')
const webPackageJson = require('../package.json') // eslint-disable-line import/no-extraneous-dependencies

const CompressionPlugin = require('compression-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

/*
 * Use UglifyJS to do tree-shaking and drop dead code. We don't want to
 * do complete uglification; that makes debugging more difficult.
 */
const uglifyPluginOptions = {
    uglifyOptions: {
        ie8: false,
        mangle: false,
        warnings: false,
        compress: {
            // These options configure dead-code removal
            dead_code: true,
            unused: true,

            // These options configure uglification. For development,
            // we don't uglify completely.
            booleans: false,
            collapse_vars: false,
            comparisons: false,
            conditionals: false,
            drop_debugger: false,
            evaluate: false,
            if_return: false,
            join_vars: true,
            keep_fnames: true,
            loops: false,
            properties: true,
            reduce_vars: false,
            sequences: false
        }
    },
    // This is necessary to get maps with the Uglify plugin
    sourceMap: true
}
const uglifyJSPlugin = new UglifyJsPlugin(uglifyPluginOptions)

/*
 * Produce compressed (gzipped) versions of assets so that the development
 * (preview) server can serve them. Production doesn't need this, because
 * the CDN handles it.
 */
const compressionPluginOptions = {
    algorithm: 'gzip',
    test: /\.(js|html|css)$/,
    threshold: 2048,
    minRatio: 0.8
}

const cssLoader = ExtractTextPlugin.extract([
    {
        loader: 'css-loader?-autoprefixer',
        options: {
            // Don't use css-loader's automatic URL transforms
            url: false
        }
    },
    // Manually specify the path to the postcss config
    // so that we can use one single file for all webpack configs that use it
    {
        loader: 'postcss-loader',
        options: {
            config: {
                path: '../web/webpack/postcss.config.js'
            }
        }
    },
    'sass-loader'
])

// Handle loading and transforming PWA scss files
mainConfig.module.rules = mainConfig.module.rules.concat({
    test: /\.scss$/,
    loader: cssLoader,
    include: [
        /node_modules\/progressive-web-sdk/,
        /app/
    ]
})

mainConfig.output.publicPath = `https://${ip.address()}:8443/`

mainConfig.plugins = mainConfig.plugins.concat([
    new webpack.NoEmitOnErrorsPlugin()
])

// Handle loading and transforming non-PWA scss files
nonPWAConfig.module.rules = nonPWAConfig.module.rules.concat({
    test: /\.scss$/,
    loader: cssLoader,
    include: [
        /node_modules\/progressive-web-sdk/,
        /app/,
        /non-pwa/
    ]
})

let configs = [mainConfig, loaderConfig, workerConfig, nonPWAConfig, translationsConfig]

// Apply shared settings to all configs
configs.forEach((config) => {
    config.mode = 'development'
    config.plugins = config.plugins.concat([
        new webpack.DefinePlugin({
            DEBUG: true
        }),
        new CompressionPlugin(compressionPluginOptions)
    ])

    if (config.optimization) {
        config.optimization.minimizer = [uglifyJSPlugin]
    } else {
        config.optimization = {
            minimizer: [uglifyJSPlugin]
        }
    }
})

if (webPackageJson.mobify && webPackageJson.mobify.ssrEnabled) {
    configs = configs.concat(ssrConfigs)
}

module.exports = configs
