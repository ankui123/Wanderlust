const Listing = require("../models/Listing.js");
const axios = require('axios');
const MAPTILER_API_KEY = process.env.MAP_TOKEN;

module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    console.log(allListings);
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm =  (req,res) => {
    res.render("listings/new.ejs");
};
module.exports.showListing = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate: {
        path:"author",
        },
    })
    .populate("owner");
    if (!listing) {
          req.flash("error", "Listing you requested for does not exist!"); 
          res.redirect("/listings");
    }
    console.log(listing);
     res.render("listings/show.ejs",{listing});
};
module.exports.createListing = async(req,res,next) => {
  const location = req.body.listing.location;
  const apikey = MAPTILER_API_KEY ;
  let response;

  try{
    response = await axios.get("https://api.maptiler.com/geocoding/" + encodeURIComponent(location) + ".json",{
       params: {
       key: apikey,
       limit:1 
    }
  });
  if (response.data.features.length === 0){
     req.flash("error", "Invalid location - unable to geocode");
     return res.redirect("/listings/new");
   }
  }catch (err) {
    console.error("Geocoding failed:", err.message);
    res.status(500).send("Geocoding Failed");
  }

  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = {url, filename}
  newListing.geometry = response.data.features[0].geometry;
  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

 
module.exports.renderEditForm =async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    let originalImageUrl = listing.image.url;
     originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_250,w_250");
     res.render("listings/edit.ejs",{listing, originalImageUrl});
};
module.exports.updateListing = async(req,res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});
     
    if (typeof req.file !== "undefined"){
     let url = req.file.path;
     let filename = req.file.filename;
     listing.image = {url, filename};
     await listing.save();
    }
     req.flash("success", "Listing updated");
     res.redirect(`/listings/${id}`);
};
module.exports.destroyListing = async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
     req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};