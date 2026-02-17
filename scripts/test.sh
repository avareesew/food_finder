#!/bin/bash

echo "Running tests..."

npm run build

if [ $? -eq 0 ]; then
  echo "Build successful"
else
  echo "Build failed"
fi
