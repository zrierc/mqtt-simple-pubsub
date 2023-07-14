#!/bin/bash
rm -rf ./dist
tsc
rm function.zip
cp -R node_modules dist/node_modules
cd ./dist/ || exit
zip -r ../function.zip ./*
cd ..