# 8jj
8JoJimaで開発合宿したやつ

## やりたいこと
- iOSのモバイル端末Aで、別のPC端末Bで鳴ってる音を流したい
- イカデンワとかSkypeとか、PCで鳴ってる音をそのまま聴く専のクライアント
- WebRTCはもちろん使えないが、WebSocketが使えるならなんとかなるのでは！
  - Binaryで送るとかMediaRecorderでファイルにして送るとか

## 調べる・試す
- 先人の資料を読む
  - https://blog.agektmr.com/2012/03/websocket.html
    - https://github.com/agektmr/AudioStreamer
  - http://blog.livedoor.jp/kotesaki/archives/1544696.html
  - https://github.com/scottstensland/websockets-streaming-audio
  - https://github.com/binaryjs/binaryjs
- WebSocket(socket.io)を適当に立てておさらい
  - もれなく実機で見る
- バイナリメッセージングとは
- ローカルの音を拾ってサーバーに投げる
- もらった音を鳴らす
