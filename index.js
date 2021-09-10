// 必要なパッケージの定義
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const fs = require("fs");

// ファイルの自動更新 https://blog-and-destroy.com/25538 
// https://tombomemo.com/browser-sync-install-usage/参考

// 接続の確認
io.on('connection', function(socket){
	  socket.on('chat message', function(msg){
		      io.emit('chat message', msg);
		    });
});

// Nginxサーバのアクセスログの読み込み
let access = fs.readFileSync("/var/log/nginx/access.log", "utf-8");
console.log("NAOからの通信を確認します")
console.log(access)

// ファイルの表示：reqは request，resは responce
app.get('/', function(req, res){
	// index.htmlファイルの読み込み
	res.sendFile(__dirname + '/index.html');
	// アクセスログのブラウザ表示
	res.end(access);
});

// WebSocketサーバの起動
http.listen(port, function(){
	  console.log('listening on *:' + port);
});
