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

### ローカルで動作確認する場合

[sam local invoke](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-local-invoke.html) を使用して、コードの実行ができる。

事前に `make prepare-local-invoke` を実行して、`sam local invoke` 用のファイルを生成させる。生成された以下のファイルの一部を置換する。

* `local/env.json`
  * `<your notion token>` の部分を、生成したトークンへ置き換える
* `local/event.json`
  * `<your notion database_id>` の部分を、使用したいデータベースの ID へ置き換える

以下のコマンドを実行することでローカルでの動作確認ができる。

```sh
# コードを変更した場合は都度ビルドする
sam build

# PutterFunctoin を実行する
sam local invoke PutterFunction --env-vars local/env.json --event local/event.json

# 以下でも実行できる
make invoke-putter
```

### AWS 上にデプロイしながら動作確認する場合

[sam sync](https://docs.aws.amazon.com/ja_jp/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-sync.html) を使用することで、コードの変更を検知しながら自動的に AWS 上へデプロイされる。

```sh
sam sync --stack-name {{stack-name}} --watch --parameter-overrides NotionApiToken={{your-notion-token}}
```

## CloudFormation スタックの削除

AWS 上に作成された CloudFormation スタックの削除は以下で行う。

```sh
sam delete --stack-name {{stack-name}}
```
