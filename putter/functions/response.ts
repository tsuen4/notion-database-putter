import { APIGatewayProxyResult } from 'aws-lambda';

export const handleResponse = (statusCode: number, message: string): APIGatewayProxyResult => {
    return {
        statusCode,
        body: JSON.stringify({
            message,
        }),
    };
};
