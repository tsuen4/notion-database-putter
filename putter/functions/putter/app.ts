import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { formatInTimeZone } from 'date-fns-tz';
import { NotionDatabasePutterAction } from './notion-database-putter-action';
import { RequestBody, RequestBodyType } from '../entity';
import { handleResponse } from '../response';
import { BlockGenerator } from './block-generator';

const token = process.env.NOTION_API_TOKEN;
const today = formatInTimeZone(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');

export async function lambdaHandler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    if (token === undefined) {
        console.log('token is undefined');
        return handleResponse(500, 'some error happened');
    }

    let body: RequestBodyType;
    try {
        body = RequestBody.parse(JSON.parse(event.body ?? '{}'));
    } catch (err) {
        console.error(err);
        return handleResponse(422, 'Unprocessable Entity');
    }

    const blockGenerator = new BlockGenerator().enableSplitLine().enableIncludeUrl();

    const action = new NotionDatabasePutterAction(token, body.database_id, blockGenerator);
    try {
        await action.invoke(today, body.content);
    } catch (err) {
        console.error(err);
        return handleResponse(500, 'some error happened');
    }

    return handleResponse(201, 'created');
}
