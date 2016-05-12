#!/bin/bash
set -e
# Any subsequent(*) commands which fail will cause the shell script to exit immediately
npm update
npm install;
bower update
bower install;
grunt build $@;

if [ -d ./navigator-zip ] ; then
    rm -rf ./navigator-zip;
fi

mkdir navigator-zip;
mv navigator.zip ./navigator-zip/;
cp -r app/conf ./navigator-zip/;

cd navigator-zip;
unzip navigator.zip;

# Start server
python -m SimpleHTTPServer;
cd ..;
