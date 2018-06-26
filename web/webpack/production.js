/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

/* eslint-disable import/no-commonjs */
/* eslint-env node */

const webpack = require('webpack')
const assign = require('lodash.assign')

const baseLoaderConfig = require('./base.loader')
const baseMainConfig = require('./base.main')
const workerConfig = require('./base.worker')
const nonPWAConfig = require('./base.non-pwa')
const translationsConfig = require('./base.translations')

const ExtractTextPlugin = require('extract-text-webpack-plugin')

const cssLoader = ExtractTextPlugin.extract([
    {
        loader: 'css-loader?-autoprefixer',
        options: {
            // Don't use css-loader's automatic URL transforms
            url: false,
            minimize: true
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

// Add production flag to main app config
const productionMainConfig = assign(baseMainConfig, {
    // Extend base config with production settings here
    plugins: [].concat(baseMainConfig.plugins, [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
        })
    ])
})

// Handle loading and transforming PWA scss files
productionMainConfig.module.rules = productionMainConfig.module.rules.concat({
    test: /\.scss$/,
    loader: cssLoader,
    include: [
        /progressive-web-sdk/,
        /app/
    ]
})

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

const configs = [productionMainConfig, baseLoaderConfig, workerConfig, nonPWAConfig, translationsConfig]

// Apply shared settings to all configs
configs.forEach((config) => {
    config.mode = 'production'
    config.plugins = config.plugins.concat([
        new webpack.DefinePlugin({
            DEBUG: false
        })
    ])
})

module.exports = configs
