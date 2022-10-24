const express = require('express');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config');
const router = express.Router();
const  {check, validationResult } = require('express-validator/check');
const User = require('../../models/User');

// router.get('/', (req, res) => res.send('USER ROUTE'));
router.post('/',[
    check('name', 'NAME IS REQUIRED').not().isEmpty(),
    check('email', 'EMAIL IS REQUIRED').isEmail(),
    check('password', 'PASSWORD IS REQUIRED MIN 6 CHARACTERS').isLength({ min: 6 }),
] ,async (req, res) => { 
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }
     
    const {name,email,password} = req.body;
     try {
    //SEE IF USER EXISTS
       let user = await User.findOne({ email });
       if(user){
        return res.status(400).json({errors: [{msg: 'USER ALREADY EXISTS'}]});
       }
    // GET USERS GRAVATAR
       const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
       })

       user = new User({ name, email, avatar, password });

    //ENCRYPT PASSWORD
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

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