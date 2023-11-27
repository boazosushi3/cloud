import { DynamoDB } from 'aws-sdk';

function buildResponse(statusCode: number, body: any) {
    return {
      statusCode: statusCode,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
}

function extractUserIdFromPath(event: any) {
    const pathSegments = event.path.split('/');
    return pathSegments[pathSegments.length - 1];
}

async function scanDynamoRecords(scanParams: DynamoDB.DocumentClient.ScanInput, itemArray: any[]): Promise<any[]> {
    try {
      const dynamodb = new DynamoDB.DocumentClient();
      const dynamoData = await dynamodb.scan(scanParams).promise();
      itemArray = itemArray.concat(dynamoData.Items);
      if (dynamoData.LastEvaluatedKey) {
        scanParams.ExclusiveStartKey = dynamoData.LastEvaluatedKey;
        return await scanDynamoRecords(scanParams, itemArray);
      }
      return itemArray;
    } catch(error) {
      console.error(error);
      return [];
    }
}

const encapsulateBody = (event: any) => {
    let body = event.body;
    if (event.isBase64Encoded) {
        body = JSON.parse(Buffer.from(event.body, 'base64').toString('utf-8'));
    }
    console.log('body ----> ', body);
    return body;
}

export const getUsers = async () => {
    const tableName = process.env.TABLE_NAME;
    const allUsers = await scanDynamoRecords({ TableName: tableName ?? '' }, []);
    const body = {
      users: allUsers
    }
    return buildResponse(200, body);
  
}

export const createUser = async (event: any) => {
    console.log('event ---> ', event);
    const body = encapsulateBody(event);
    const dynamodb = new DynamoDB.DocumentClient();
    const tableName = process.env.TABLE_NAME ?? '';
    try {
        await dynamodb.put({ TableName: tableName, Item: body }).promise();
        const response = {
            Operation: 'SAVE',
            Message: 'SUCCESS',
            Item: event.body,
          }
          return buildResponse(200, response);
    } catch (error) {
        console.error(error);
        return buildResponse(500, { error: 'Internal Server Error' });
    }
}

export const modifyUser = async (event: {user_id: string, updateKey: 'age', updateValue: number}) => {
    console.log('event ---> ', event);
    const body = encapsulateBody(event);
    const params = {
        TableName: process.env.TABLE_NAME ?? '',
        Key: {
        'user_id': body.user_id,
        },
        UpdateExpression: `set ${body.updateKey} = :value`,
        ExpressionAttributeValues: {
        ':value': body.updateValue
        },
        ReturnValues: 'UPDATED_NEW'
    }
    const dynamodb = new DynamoDB.DocumentClient();
    return await dynamodb.update(params).promise().then((response) => {
        const responseBody = {
        Operation: 'UPDATE',
        Message: 'SUCCESS',
        UpdatedAttributes: response
        }
        return buildResponse(200, responseBody);
    }, (error) => {
        console.error(error);
        return buildResponse(500, { error: 'Internal Server Error' });
    })
}

export const deleteUser = async (event: any) => {
    console.log('event ---> ', event);
    const userId = extractUserIdFromPath(event);
    const params = {
        TableName: process.env.TABLE_NAME ?? '',
        Key: {
        'user_id': userId
        },
        ReturnValues: 'ALL_OLD'
    }
    const dynamodb = new DynamoDB.DocumentClient();
    return await dynamodb.delete(params).promise().then((response) => {
        const body = {
        Operation: 'DELETE',
        Message: 'SUCCESS',
        Item: response
        }
        return buildResponse(200, body);
    }, (error) => {
        console.error(error);
        return buildResponse(500, { error: 'Internal Server Error' });
    })
}

export const getUserById = async (event: any) => {
    const userId = extractUserIdFromPath(event);
    const params = {
        TableName: process.env.TABLE_NAME ?? '',
        Key: {
          'user_id': userId
        }
      }
      const dynamodb = new DynamoDB.DocumentClient();
      return await dynamodb.get(params).promise().then((response) => {
        return buildResponse(200, response.Item);
      }, (error) => {
        console.error(error);
        buildResponse(500, { error: 'Internal Server Error' });
      });
    
}
