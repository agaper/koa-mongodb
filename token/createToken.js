const jwt = require('jsonwebtoken');

module.exports = function(id){
  const token = jwt.sign(
    { 
      id: id 
    },
    'cedric1990',
    {
      expiresIn: '300s'
    }
  );
  return token;
}
