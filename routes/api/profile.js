const express = require('express');
const router = express.Router();
const  {check, validationResult } = require('express-validator/check');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

router.get('/me',auth, async (req, res) => {
    try{
        const profile = await Profile.findOne({user: req.user.id}).populate('user',['name','avatar']);
        if(!profile){
            return res.status(400).json({msg: 'THIS IS NO PROFILE FOR THIS USER'}); 
        }
        res.json(profile);
    }catch(err){
        console.error(err.message);
        res.status(500).send('SERVER ERROR');
    }
});


// UPDATE OR CREATE PROFILE
router.post('/', [auth,[
    check('status', 'STATUS IS REQUIRED').not().isEmpty(),
    check('skills', 'SKILLS IS REQUIRED').not().isEmpty(),
]], async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const {company, website, location, bio, status, githubusername, skills, youtube, facebook, twitter, instagram, linkedin,reddiit} = req.body;
    const profileFields = {};
    profileFields.user = req.user.id;
    if(company) profileFields.company = company;
    if(website) profileFields.website = website;
    if(location) profileFields.location = location;
    if(bio) profileFields.bio = bio;
    if(status) profileFields.status = status;
    if(githubusername) profileFields.githubusername = githubusername;
    if(skills) { profileFields.skills = skills.split(',').map(skill => skill.trim()); } 

    profileFields.social = {};
    if(youtube) profileFields.social.youtube = youtube;
    if(twitter) profileFields.social.twitter = twitter;
    if(facebook) profileFields.social.facebook = facebook;
    if(linkedin) profileFields.social.linkedin = linkedin;
    if(instagram) profileFields.social.instagram = instagram; 
    if(reddiit) profileFields.social.reddiit = reddiit; 
     
    try{
        let profile = await Profile.findOne({ user: req.user.id });
        if(profile){
            //UPDATE
            profile = await Profile.findOneAndUpdate({ user: req.user.id}, { $set: profileFields}, {new: true} );
            return res.json(profile);
        }

        //CREATE
        profile = new Profile(profileFields);
        await profile.save();
        res.json(profile);
       
    }catch(err){
        console.error(err.message);
        res.status(500).send('SERVER ERROR');
    }

});

// GET ALL PROFILES
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles);
    }catch(err){
        console.error(err.message);
        res.status(500).send('SERVER ERROR');
    }

});


// GET PARTICULAR PROFILE
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', ['name', 'avatar']);
        if(!profile) return res.status(400).json({ msg : "PROFILE NOT FOUND" });
        res.json(profile);
    }catch(err){
        console.error(err.message);
        if(err.kind == "ObjectId"){
            return res.status(400).json({ msg : "PROFILE NOT FOUND" });
        }
        res.status(500).send('SERVER ERROR');
    }

});





module.exports = router;