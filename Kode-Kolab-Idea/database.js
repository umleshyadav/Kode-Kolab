const { body, validationResult } = require('express-validator');
app.post('/user', [body('email').isEmail()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(errors.array());
  // proceed with creating user
});