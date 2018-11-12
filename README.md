# image-thumbnailer

图片缩略图服务。

这是一个 HTTP 服务，给它一个图片目录，它将提供原图和缩略图。

## HTTP API

```
HTTP GET /img/:filename
HTTP GET /img/:d1/:filename
HTTP GET /img/:d1/:d2/:filename
HTTP GET /img/:d1/:d2/:d3/:filename
HTTP GET /img/:d1/:d2/:d3/:d4/:filename
```
其中，`:d*` 是图片目录下的子目录的名称，`:filename` 是文件名。

参数：

- w - 可选，缩略图的宽度
- h - 可选，缩略图的高度

行为规则：

- 如果 w 和 h 都没有提供，则得到原图；
- 如果 w 和 h 比原图大，也得到原图；
- 如果只提供了 w 和 h 二者之一，则维持宽高比；
