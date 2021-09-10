// 必要なパッケージの定義
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const port = process.env.PORT || 3000;
const fs = require("fs");
const webdriver = require('selenium-webdriver');
const { Builder, By, Key, until } = require('selenium-webdriver');
const ssh  = require('node-ssh');

// browser-sycnによるファイルの自動更新 https://blog-and-destroy.com/25538 
// https://tombomemo.com/browser-sync-install-usage/参考

// 接続の確認
io.on('connection', function(socket){
	  socket.on('chat message', function(msg){
		      io.emit('chat message', msg);
		    });
});

// NAOへのssh
async function main() {
  const ssh = new ssh();

  const sshPassword = 'kashi-lab';
  
  // 接続
  await ssh.connect({
      host: '192.168.11.18',
      port: 22,
      username: 'nao',
      password: sshPassword
  });

  // コマンド実行
  res = await ssh.execCommand('ls -al', {options: {pty: true}});

  // 切断
  ssh.dispose();
}

main();

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

// Seleniumによるブラウザの自動起動
let driver;
(async () => {
  try {
    driver = await new Builder().forBrowser('chrome').build();

    await driver.get('https://www.google.co.jp/');
    await driver.findElement(By.name('q')).sendKeys('webdriver', Key.RETURN);
    await driver.wait(until.titleIs('webdriver - Google 検索'), 5000); 
    // await driver.sleep(5000);
  }
  catch(error) {
    console.error(error);
  }
  finally {
    if(driver) {
      await driver.quit();
    }
  }
})();

// スライドのページ遷移
// NAOからcurlがあった場合もしくは
// NAOのNginxのaccesslogの行数が更新された場合，
// 次のスライドに遷移するという条件を追記

// スライドサーバの起動
http.listen(port, function(){
	  console.log('listening on *:' + port);
});
