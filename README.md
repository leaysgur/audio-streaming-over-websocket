# 8jj
8JoJimaで開発合宿したやつ

## やりたいこと
- iOSのモバイル端末Aで、別のPC端末Bで鳴ってる音を流したい
- イカデンワとかSkypeとか、PCで鳴ってる音をそのまま聴く専のクライアント
- WebRTCはもちろん使えないが、WebSocketが使えるならなんとかなるのでは！
  - Binaryで送るとかMediaRecorderでファイルにして送るとか

## 調べる
- 先人の資料を読む
  - https://subvisual.co/blog/posts/39-tutorial-html-audio-capture-streaming-to-node-js-no-browser-extensions
  - https://blog.agektmr.com/2012/03/websocket.html
    - https://github.com/agektmr/AudioStreamer
  - http://blog.livedoor.jp/kotesaki/archives/1544696.html
  - https://github.com/scottstensland/websockets-streaming-audio
  - https://github.com/binaryjs/binaryjs
  - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC
- やり方は2つありそう
  - その場で音を録音して、それをバイナリとして送る
  - そのまま送る
- と思ったけど1つ(詳細で2つ)しかなさそう
  - MediaRecorderでwebmにしてそれを送る
   - https://github.com/mganeko/wmls/blob/master/views/golive.ejs
   - audioOnProcessでバッファを送る
   - AudioBufferをそのまま？もしくは中のデータをint16にしてそれぞれ？

## TODO
- 裏タブにいくと乱れる問題
- UIのブラッシュアップ
- Next
  - ラジオっぽくするべくストリームを切り替えたりするか
