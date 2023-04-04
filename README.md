# notion-database-putter

Notion のデータベースにテキストを投げる AWS Lambda 関数。
[AWS SAM CLI](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/install-sam-cli.html) でスタックを作成している。

## デプロイ

```sh
sam build

# 初回(=samconfig.tomlが無い場合)のみ --guided オプションを使用して生成させる
sam deploy --guided

# 初回以外は以下でデプロイ
sam deploy
```

## 開発

[sam sync](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-sync.html) を使用することで、AWS 上にデプロイしながらテストできる。Lambda から Lambda を呼び出す処理を書いている都合で [sam local start-api](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-start-api.html) による動作確認ができない。

```sh
sam sync --stack-name {{stack-name}} --watch --parameter-overrides NotionApiToken={{your-token}}
```
