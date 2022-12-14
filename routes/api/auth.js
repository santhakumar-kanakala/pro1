const express = require('express');
const auth = require('../../middleware/auth');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../../models/User');
const jwt = require('jsonwebtoken');
const config = require('config');
const  {check, validationResult } = require('express-validator/check'); 

router.get('/', auth, async (req, res) => {
    try{
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    }catch(err){
      console.error(err.message);
      res.status(500).send('SERVER ERROR');
    }
});


router.post('/',[ 
    check('email', 'EMAIL IS REQUIRED').isEmail(),
    check('password', 'PASSWORD IS REQUIRED').exists(),
] ,async (req, res) => { 
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
     
    const {email,password} = req.body;
     try {
    //SEE IF USER EXISTS
       let user = await User.findOne({ email });
       if(!user){
        return res.status(400).json({errors: [{msg: 'INVALID CREDENTIALS'}]});
       }

       const isMatch = await bcrypt.compare(password, user.password);
       if(!isMatch){
         return res.status(400).json({errors: [{msg: 'INVALID CREDENTIALS'}]});
       }
 
    // RETURN JSONWEBTOKEN
    const payload = {
        user: {
            id: user.id
        }
    }
    jwt.sign(payload, config.get('jwtSecret'), { expiresIn : 360000 }, (err, token) => {
         if(err) throw err;
         res.json({ token });
    });
    //   res.send('USER REGISTERED');
     }catch(err){
       console.error(err.message);
       res.status(500).send('SERVER ERROR');
     }

});

module.exports = router;