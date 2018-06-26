#!/usr/bin/env bash

sdk-get-routes
sdk-create-hash-manifest

webpack --config webpack/dev.js

webpack --watch --config webpack/dev.js &

if [ "$1" == "inspect" ]
then
    nodemon -- --inspect --expose-gc build/ssr.js
else
    nodemon -- --expose-gc build/ssr.js
fi