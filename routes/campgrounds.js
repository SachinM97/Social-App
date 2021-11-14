const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
// const { campgroundSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');
const methodOverride = require('method-override');
const multer = require('multer');
const { storage } = require("../cloudinary");
const upload = multer({ storage });
const Review = require('../models/review');
const Campground = require('../models/campground');
const User = require('../models/user');


router.get('/', isLoggedIn, catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds })
}));



router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
})

router.post('/', isLoggedIn, upload.array('image'), catchAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    // const user = await User.findById() 
    campground.owner = req.user._id;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    // campground.info = req.files.map(f => ({ title: f.title, location: f.location, status: f.status }));
    // campground.author = req.user._id;
    await campground.save();
    console.log("campground: ", campground);
    // const campgrounds = await Campground.find({});
    // campground = campgrounds
    // console.log("show_campground: ", campgrounds)
    req.flash('success', 'Successfully made a new Post!');
    res.redirect('campgrounds/index')
}))


router.get('/index', isLoggedIn, async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds });
})


router.get('/AllUsers', isLoggedIn, async (req, res) => {
    const users = await User.find({})
    res.render('campgrounds/AllUsers', { users });
})

router.post('/AllUsers', isLoggedIn, async (req, res) => {
    const user = await req.body.search;
    const campgrounds = await Campground.find({})
    const profiles = []
    for (let campground of campgrounds) {
        const camp = await campground.populate('owner');
        if (user.toLowerCase() === camp.owner.username.toLowerCase()) {
            profiles.push(camp)
        }
    }
    res.render('campgrounds/profile', { profiles });
})


router.get('/profile', isLoggedIn, catchAsync(async (req, res, next) => {
    // console.log("req: ", req)
    const user = await User.findById(req.user._id)
    const campgrounds = await Campground.find({})
    const profiles = []
    for (let campground of campgrounds) {
        const camp = await campground.populate('owner');
        if (user.username === camp.owner.username) {
            profiles.push(camp)
        }
    }
    res.render('campgrounds/profile', { profiles })
}))


router.get('/:id', isLoggedIn, catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: 'owner'
    }).populate('owner');
    console.log(campground);
    if (!campground) {
        req.flash('error', 'Cannot find that Post!');
        return res.redirect('/campgrounds/index');
    }
    res.render('campgrounds/show', { campground });
}));

router.post('/:id/reviews', catchAsync(async (req, res) => {
    // res.send("YOU MADE IT!!!!")
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: 'owner'
    }).populate('owner');
    console.log(campground)
    const review = new Review(req.body.review);
    review.owner = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}))


router.delete('/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`)
    // res.send("DELETE ME!!!!")
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    // res.send("Edit the page!!!")
    const campground = await Campground.findById(req.params.id)
    //  if (!campground) {
    //         req.flash('error', 'Cannot find that Post!');
    //      return res.redirect('/campgrounds');
    //  }
    res.render('campgrounds/edit', { campground });
}))
router.put('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'Successfully updated!')
    res.redirect(`/campgrounds/${campground._id}`);
    // console.log("Hit put route")
    // const { id } = req.params;
    // const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }, { new: true });
    // // await campground.save();
    // console.log(campground);
    // req.flash('success', 'Successfully updated Profile!');
    // res.redirect('index');
}));



// router.get('/:id', catchAsync(async (req, res,) => {
//     const campground = await Campground.findById(req.params.id).populate('reviews');
//     if (!campground) {
//         req.flash('error', 'Cannot find that Post!');
//         return res.redirect('/campgrounds');
//     }
//     res.render('campgrounds/show', { campground });
// }));

// router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
//     const campground = await Campground.findById(req.params.id)
//     if (!campground) {
//         req.flash('error', 'Cannot find that Post!');
//         return res.redirect('/campgrounds');
//     }
//     res.render('campgrounds/edit', { campground });
// }))

// router.put('/:id', isLoggedIn, catchAsync(async (req, res) => {
//     const { id } = req.params;
//     const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
//     req.flash('success', 'Successfully updated Profile!');
//     res.redirect(`/ campgrounds / ${ campground._id }`)
// }));

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Post')
    res.redirect('/campgrounds/index');
}));

module.exports = router;