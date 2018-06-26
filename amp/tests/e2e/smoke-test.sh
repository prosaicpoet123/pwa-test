#!/bin/bash -eu
set -o pipefail
set -o nounset

# Run automated end-to-end (e2e) tests for AMP.

echo "Running tests against local build"
# Kill background processes when this script exits.
trap 'kill $(jobs -pr)' EXIT
npm start > /dev/null 2>&1 &

# Windows does not have a built-in nc command
if [[ "$OSTYPE" == "msys" ]]; then
	echo "Wait 10 seconds for server to start"
	sleep 10
else 
	echo "Wait for server to start"
	while ! echo exit | nc localhost 3000; do sleep 5; done
fi

# If on CIRCLE, it will find all test files under /workflows to distribute evenly among machines for parallelism
VALUE=${CIRCLECI:-}

if [[  -z "${VALUE}" ]]; then
    npm run test:e2e
else
  testfiles=$(find ./tests/e2e/workflows/ -name '*.js'| sort | awk "NR % ${CIRCLE_NODE_TOTAL} == ${CIRCLE_NODE_INDEX}")
  if [ -z "$testfiles" ]
  then
      echo "more parallelism than tests"
  else
      npm run test:e2e --tests $testfiles
  fi
fi

