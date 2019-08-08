const axios = require("axios");
const qs = require("qs");

const jwt = require('jsonwebtoken');
const fs = require('fs');



exports.handler = function(event, context, callback) {
  // apply our function to the queryStringParameters and assign it to a variable
  const API_PARAMS = qs.stringify(event.queryStringParameters);
  // Get env var values defined in our Netlify site UI
  const { API_TOKEN, API_URL } = process.env;
  // In this example, the API Key needs to be passed in the params with a key of key.
  // We're assuming that the ApiParams var will contain the initial ?
  const URL = `${API_URL}?${API_PARAMS}&key=${API_TOKEN}`;

  // Let's log some stuff we already have.
  console.log("Injecting token to", API_URL);
  console.log("logging event.....", event);
  console.log("Constructed URL is ...", URL);
  // -----BEGIN PRIVATE KEY-----   -----END PRIVATE KEY-----
  //const pkey = "-----BEGIN PRIVATE KEY-----MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgP2D9keR998MsYnTIJQrb8eAa+wbmHnoqMxr+fn162sygCgYIKoZIzj0DAQehRANCAAShnR+a/Etj1L07zUDHAVHf0X4bp4tD9IL/+DNrDgPgiumZIZemQobweK562tP8V9ZUBtioq7bGl+fu6nn28Zme-----END PRIVATE KEY-----";
  //console.log("pkey is: ", pkey);
  const private_key = fs.readFileSync('AuthKey_4MR8KL2MS6.p8').toString();
  const team_id = 'TEAM_ID'; // your 10 character apple team id, found in https://developer.apple.com/account/#/membership/
  const key_id = 'KEY_ID'; // your 10 character generated music key id. more info https://help.apple.com/developer-account/#/dev646934554
  const token = jwt.sign({}, private_key, {
    algorithm: 'ES256',
    expiresIn: '180d',
    issuer: team_id,
    header: {
      alg: 'ES256',
      kid: key_id
    }
  });
  var tString = '{ "token": ' +'"' + token+'"}';

  //debug below -- toDelete in production
  var jsonObj = JSON.parse(tString);
  console.log("JSON OBJ:",jsonObj);
  //debug above -- toDelete in production


  // Here's a function we'll use to define how our response will look like when we call callback
  const pass = body => {
    callback(null, {
      statusCode: 200,
      json: true,
      body: tString
    });
  };

  console.log(pass.body);

  // Perform the API call.
  const get = () => {
    axios.get(URL)
    .then((response) =>
      {
        console.log(response.data)
        pass(response.data)
      }
    )
    .catch(err => pass(err))
  }
  if (event.httpMethod == "GET") {
    get();
  }
};
