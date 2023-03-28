// Import JSON WEB TOKEN
const jwt = require('jsonwebtoken');

// Variable for storing JET Sceret
let jwtSecret;

// Variable for storing JWT issuer and expiring
let jwtOption;
setJwtOptions = async (option) => {
  jwtOption = option;
};

setJwtSecret = async (secret) => {
  jwtSecret = secret;
};

//  jwt token generation
generateJwtToken = async (user) => {
  const tokenElements = { id: user.id, role_id: user.role_id };
  return await jwt.sign(tokenElements, jwtSecret, jwtOption);
};

module.exports = {
  generateJwtToken,
  setJwtOptions,
  setJwtSecret,
  jwtOption,
  jwtSecret,
};
