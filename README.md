# image-thumbnailer

图片缩略图服务。

1. HTTP Server

这是一个 HTTP 服务，给它一个图片目录，它将提供原图和缩略图。

2. Daemon

这是另一个服务，它监视一个目录，为每个新增的图片文件创建缩略图。

如果运行：
```
$ node bin/thumbnail-daemon.js "/data/images"
# or
$ pm2 start bin/thumbnail-daemon.js -- "/data/images"
```

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

## 如何运行

```
IMAGES_DIR=... node bin/www
```

支持的环境变量：

- IMAGES\_DIR - 图片目录，如 `/var/lib/images`，`E:\GrandLynn\PM-Server\data\fserver`；
- PORT - HTTP 服务端口，缺省为 3000；
- ENV - 缺省为 `production`，如果设置为 `development`，则出错情况下应答体的信息会丰富一些；
