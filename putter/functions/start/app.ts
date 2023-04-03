import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { LambdaClient, InvokeCommand, InvokeCommandInput } from '@aws-sdk/client-lambda';
import { handleResponse } from '../response';

const asciiDecoder = new TextDecoder();
const client = new LambdaClient({});

export async function lambdaHandler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    const param: InvokeCommandInput = {
        FunctionName: process.env.START_FUNCTION_ARN,
        InvocationType: 'Event',
        Payload: Buffer.from(JSON.stringify(event)),
    };
    const command = new InvokeCommand(param);
    const { StatusCode, Payload } = await client.send(command);

    return handleResponse(StatusCode ?? 500, asciiDecoder.decode(Payload));
}
