# notion-database-putter

Notion のデータベースにテキストを投げる AWS Lambda 関数。
[AWS SAM CLI](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/install-sam-cli.html) でスタックを作成している。

## デプロイ

デプロイ前にビルドする。

```sh
sam build
```

以下のコマンドでデプロイできる。

```sh
# 初回(=samconfig.tomlが無い場合)のみ --guided オプションを使用して生成させる
# NotionApiToken の設定が必要
sam deploy --guided

# 初回以外は以下でデプロイ
sam deploy
```

## デプロイ後の使用方法

デプロイ後の Outputs に記載されている URL へ、以下の内容を POST する。

```json
{
    "database_id": "<your notion database_id>",
    "content": "<text>"
}
```

## 開発

[sam sync](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-sync.html) を使用することで、AWS 上にデプロイしながら動作確認ができる。

```sh
sam sync --stack-name {{stack-name}} --watch --parameter-overrides NotionApiToken={{your-token}}
```

## CloudFormation スタックの削除

スタックの削除は以下で行う。

```sh
sam delete --stack-name {{stack-name}}
```
