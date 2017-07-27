#!/bin/bash

set -eu

fullfile=${1:?no file}
dirname="$(dirname "$fullfile")"
filename=$(basename "$fullfile")
extension="${filename##*.}"
filename="${filename%.*}"

# see http://www.iab.net/guidelines/508676/508767/displayguidelines
for format in 728x90 468x60 234x60 120x600 160x600 200x200 250x250 300x250 336x280 180x150 300x600 ; do
  target="${dirname}/generated/${filename}_${format}.${extension}"
  echo "$target"
  convert -size 1x1 xc:grey99 -resize ${format} -background '#fcfcfc' -gravity center -extent ${format} "${target}"
  # convert "${dirname}/${filename}.${extension}" -resize ${format} -background none -gravity center -extent ${format} "${target}"
done
