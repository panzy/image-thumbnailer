#!/bin/bash
# 扫描附件目录，为图片附件生成缩略图。

cd ../GrandLynn/PM-Server/data/fserver/
find -type f | {
  num_total_images=0
  num_new=0
  while read f
  do
    if [[ ! "$f" =~ thumbnail.jpg$ && "$f" =~ ^.+\/[^\.]+\.[a-z0-9-]+\.(jpg|jpeg|png|gif)$ ]]; then
      num_total_images=$((num_total_images+1))
      thumbnail=${f%.*}-thumbnail.jpg
      if [ ! -f "$thumbnail" ]; then
        echo gen $f '->' $thumbnail
        num_new=$((num_new+1))
        magick convert -thumbnail 100x100 "$f[0]" "$thumbnail"
      fi
    fi
  done
  echo total image files: $num_total_images
  echo new thumbnails: $num_new
}
