/**
 * Simple AWS Lambda function
 */
exports.handler = async (event, context) => {
  // Log the event information
  console.log('Event: ', JSON.stringify(event, null, 2));
  console.log('Context: ', JSON.stringify(context, null, 2));
  
  // Create a response
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Hello from Lambda!',
      input: event,
    }),
  };
  
  return response;
};
