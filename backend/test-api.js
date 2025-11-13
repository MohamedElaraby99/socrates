import https from 'https';

const testFeaturedInstructors = async () => {
  const url = 'https://api.socrates.fikra.solutions/api/v1/instructors/featured?limit=6';

  console.log('Testing featured instructors API...');
  console.log('URL:', url);

  const options = {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Node.js Test Script'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.get(url, options, (res) => {
      let data = '';

      console.log('Status Code:', res.statusCode);
      console.log('Headers:', res.headers);

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('\n=== API RESPONSE ===');
          console.log(JSON.stringify(response, null, 2));
          resolve(response);
        } catch (error) {
          console.error('Error parsing response:', error);
          console.log('Raw response:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error('Request error:', error);
      reject(error);
    });

    req.setTimeout(10000, () => {
      console.error('Request timeout');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
};

testFeaturedInstructors()
  .then(() => {
    console.log('Test completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });
