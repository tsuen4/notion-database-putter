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

## ローカル開発

以下のようにトークンをセットした `env.json` を作成する。

```json
{
    "NotionDatabasePutterFunction": {
        "NOTION_API_TOKEN": "<token value>"
    }
}
```

作成した `env.json` を読み込む形で `sam local start-api` を実行することでローカル開発サーバーが起動する。

```sh
sam local start-api --env-vars env.json
```
