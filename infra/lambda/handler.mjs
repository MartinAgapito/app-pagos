import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb'

const client = new DynamoDBClient({})
const TABLE  = process.env.TABLE_NAME
const PK     = 'user#admin'

const HEADERS = {
  'Content-Type':                 'application/json',
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
  'Access-Control-Allow-Headers': 'content-type',
}

export const handler = async (event) => {
  const method = event.requestContext?.http?.method
  const type   = event.pathParameters?.type

  if (method === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' }
  if (!type)                return { statusCode: 400, headers: HEADERS, body: '{"error":"type required"}' }

  try {
    if (method === 'GET') {
      const { Item } = await client.send(new GetItemCommand({
        TableName: TABLE,
        Key: marshall({ pk: PK, sk: type }),
      }))
      if (!Item) return { statusCode: 200, headers: HEADERS, body: 'null' }
      const { payload } = unmarshall(Item)
      return { statusCode: 200, headers: HEADERS, body: payload }
    }

    if (method === 'PUT') {
      await client.send(new PutItemCommand({
        TableName: TABLE,
        Item: marshall({ pk: PK, sk: type, payload: event.body ?? 'null' }),
      }))
      return { statusCode: 200, headers: HEADERS, body: '{"ok":true}' }
    }

    return { statusCode: 405, headers: HEADERS, body: '{"error":"method not allowed"}' }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) }
  }
}
