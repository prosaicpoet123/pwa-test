/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */
/* Copyright (c) 2018 Mobify Research & Development Inc. All rights reserved. */
/* * *  *  * *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * */

'use strict'

/* eslint import/no-commonjs:0 */
const fs = require('fs')
const https = require('https')


const remote = !!process.env.REMOTE
const sslFile = (!remote) && fs.readFileSync('./dev-server/localhost.pem')
const port = 3443
const ssrServerOptions = {
    remote
}

// Include the main module
const app = require('./utils/ssr/ssr-server').initApp(ssrServerOptions)

// The listening server
let server

if (!remote) {
    // Local development server - listening on 3443 (https)
    server = https.createServer(
        {
            key: sslFile,
            cert: sslFile
        },
        app
    )

    server.listen(port)
    console.log(
        `Local development server listening on https://localhost:${port}`
    )
}


