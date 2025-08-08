#!/bin/bash

cd $1

# Run eslint and store its exit code
npx eslint
eslint_exit_code=$?

# Exit with the combined exit code
if [ $eslint_exit_code -ne 0 ]; then
  exit 1
else
  exit 0
fi
