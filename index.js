/**
 * Lambda function with external dependencies
 * Uses axios to make HTTP requests and moment for date formatting
 */
const axios = require('axios');
const moment = require('moment');

exports.handler = async (event, context) => {
  console.log('Event received at:', moment().format('YYYY-MM-DD HH:mm:ss'));
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Make an HTTP request using axios
    const response = await axios.get('https://api.github.com/zen');
    
    // Format the current timestamp using moment
    const timestamp = moment().format('MMMM Do YYYY, h:mm:ss a');
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Lambda function executed successfully',
        githubWisdom: response.data,
        timestamp: timestamp,
        input: event
      })
    };
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error executing Lambda function',
        error: error.message,
        timestamp: moment().toISOString(),
      })
    };
  }
};
