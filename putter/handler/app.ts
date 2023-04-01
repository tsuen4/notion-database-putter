import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {z} from 'zod';
import {formatInTimeZone} from 'date-fns-tz';
import {Action} from './action';

const token = process.env.NOTION_API_TOKEN;
const today = formatInTimeZone(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');

const Body = z.object({
  database_id: z.string(),
  content: z.string(),
});

type Body = z.infer<typeof Body>;

export const handleResponse = (
  statusCode: number,
  message: string
): APIGatewayProxyResult => {
  return {
    statusCode,
    body: JSON.stringify({
      message,
    }),
  };
};

export async function lambdaHandler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (token === undefined) {
    console.log('token is undefined');
    return handleResponse(500, 'some error happened');
  }
  if (event.httpMethod !== 'POST') {
    console.log('Method Not Allowed:', event.httpMethod);
    return handleResponse(405, 'Method Not Allowed');
  }

  let body: Body;
  try {
    body = Body.parse(JSON.parse(event.body ?? '{}'));
  } catch (err) {
    console.error(err);
    return handleResponse(422, 'Unprocessable Entity');
  }

  const action = new Action(token, body.database_id);
  try {
    await action.put(today, body.content);
  } catch (err) {
    console.error(err);
    return handleResponse(500, 'some error happened');
  }

  return handleResponse(201, 'created');
}
