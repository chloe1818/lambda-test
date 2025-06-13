/**
 * Enhanced AWS Lambda function handler
 * 
 * This module exports a handler function that AWS Lambda will call
 * The handler format is: exports.handlerName
 */

// Helper function for input validation
const validateInput = (event) => {
  // Adjust validation logic based on your specific requirements
  if (!event) {
    throw new Error('Event object is required');
  }

  // API Gateway event validation
  if (event.httpMethod) {
    if (!['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].includes(event.httpMethod)) {
      throw new Error(`Unsupported HTTP method: ${event.httpMethod}`);
    }
  }
  
  return true;
};

// Helper function for successful responses
const createSuccessResponse = (data = {}, statusCode = 200) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // For CORS support
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(data),
  };
};

// Helper function for error responses
const createErrorResponse = (error, statusCode = 500) => {
  console.error('Error:', error);
  
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*', // For CORS support
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      message: error.message || 'An error occurred',
      errorType: error.name || 'Error',
    }),
  };
};

// Process different types of events based on their source
const processEvent = async (event, context) => {
  // API Gateway event
  if (event.httpMethod) {
    return await processApiGatewayEvent(event, context);
  }
  
  // S3 event
  if (event.Records && event.Records[0] && event.Records[0].s3) {
    return await processS3Event(event, context);
  }
  
  // SQS event
  if (event.Records && event.Records[0] && event.Records[0].eventSource === 'aws:sqs') {
    return await processSQSEvent(event, context);
  }
  
  // DynamoDB event
  if (event.Records && event.Records[0] && event.Records[0].eventSource === 'aws:dynamodb') {
    return await processDynamoDBEvent(event, context);
  }
  
  // Custom or default event processing
  return {
    message: 'Event processed successfully',
    input: event,
  };
};

// Process API Gateway events
const processApiGatewayEvent = async (event, context) => {
  const httpMethod = event.httpMethod;
  
  switch(httpMethod) {
    case 'GET':
      return {
        message: 'GET request processed successfully',
        path: event.path,
        queryParameters: event.queryStringParameters || {},
      };
      
    case 'POST':
      let body;
      try {
        body = event.body ? JSON.parse(event.body) : {};
      } catch (error) {
        throw new Error('Invalid request body format');
      }
      
      return {
        message: 'POST request processed successfully',
        body: body,
      };
      
    case 'PUT':
      return {
        message: 'PUT request processed successfully',
        path: event.path,
      };
      
    case 'DELETE':
      return {
        message: 'DELETE request processed successfully',
        path: event.path,
      };
      
    case 'OPTIONS':
      return {
        message: 'OPTIONS request processed successfully',
      };
      
    default:
      throw new Error(`Unsupported HTTP method: ${httpMethod}`);
  }
};

// Process S3 events
const processS3Event = async (event, context) => {
  const records = event.Records || [];
  const processedRecords = [];
  
  for (const record of records) {
    const s3 = record.s3;
    const bucket = s3.bucket.name;
    const key = s3.object.key;
    
    console.log(`Processing S3 event for s3://${bucket}/${key}`);
    
    processedRecords.push({
      bucket,
      key,
      eventName: record.eventName,
      eventTime: record.eventTime,
    });
  }
  
  return {
    message: 'S3 event processed successfully',
    processedRecords,
  };
};

// Process SQS events
const processSQSEvent = async (event, context) => {
  const records = event.Records || [];
  const processedRecords = [];
  
  for (const record of records) {
    console.log(`Processing SQS message: ${record.messageId}`);
    
    let body;
    try {
      body = JSON.parse(record.body);
    } catch (error) {
      body = record.body;
    }
    
    processedRecords.push({
      messageId: record.messageId,
      body,
    });
  }
  
  return {
    message: 'SQS event processed successfully',
    processedRecords,
  };
};

// Process DynamoDB events
const processDynamoDBEvent = async (event, context) => {
  const records = event.Records || [];
  const processedRecords = [];
  
  for (const record of records) {
    console.log(`Processing DynamoDB event: ${record.eventID}`);
    
    processedRecords.push({
      eventID: record.eventID,
      eventName: record.eventName,
      tableName: record.dynamodb.tableName,
    });
  }
  
  return {
    message: 'DynamoDB event processed successfully',
    processedRecords,
  };
};

/**
 * Main AWS Lambda handler function
 * This is the entry point that Lambda will call
 */
exports.handler = async (event, context) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Context:', JSON.stringify(context, null, 2));
  
  try {
    // Validate the input
    validateInput(event);
    
    // Process the event based on its type
    const result = await processEvent(event, context);
    
    // Return a successful response
    return createSuccessResponse(result);
  } catch (error) {
    // Handle any errors
    return createErrorResponse(error);
  }
};
