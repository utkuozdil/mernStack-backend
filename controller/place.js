const { validationResult } = require("express-validator");
const { startSession } = require("mongoose");
const fs = require("fs");

const User = require("../model/user");
const Place = require("../model/place");
const getCoordinatesForAddress = require("../util/location");
const HttpError = require("../model/httpError");

exports.getPlaceByUser = async (request, response, next) => {
  const id = request.params.id;

  let user;

  try {
    user = await User.findById(id).populate("places");
  } catch (error) {
    return next(
      new HttpError("error while fetching places with given user id", 500)
    );
  }

  if (!user || user.length === 0)
    return next(new HttpError("couldn't find a place with given user id", 404));

  response.json({
    places: user.places.map(place => place.toObject({ getters: true }))
  });
};

exports.getPlaceById = async (request, response, next) => {
  const id = request.params.id;

  let place;
  try {
    place = await Place.findById(id);
  } catch (error) {
    return next(new HttpError("error while fetching place with given id", 500));
  }

  if (!place)
    return next(
      new HttpError("couldn't find a place with given place id", 404)
    );

  response.json({ place: place.toObject({ getters: true }) });
};

exports.createPlace = async (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return next(new HttpError("invalid input", 422));

  const { title, description, address } = request.body;
  const creator = request.userData.userId;

  let location;
  try {
    location = await getCoordinatesForAddress(address);
  } catch (error) {
    return next(error);
  }

  let user;
  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(new HttpError("error while fetching user with given id", 500));
  }

  if (!user)
    return next(new HttpError("couldn't find user with given id", 404));

  const place = new Place({
    title,
    description,
    address,
    location,
    image: request.file.path.replace("\\", "/"),
    creator
  });

  try {
    /*const session = await startSession();
    session.startTransaction();
    await place.save({ session: session });
    user.places.push(place);
    await user.save({ session });
    await session.commitTransaction();*/
    await place.save();
    user.places.push(place);
    await user.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError("creating place failed", 500));
  }

  response.status(201).json({ place: place.toObject({ getters: true }) });
};

exports.updatePlace = async (request, response, next) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) return next(new HttpError("invalid input", 422));

  const { title, description } = request.body;
  const id = request.params.id;

  let place;
  try {
    place = await Place.findById(id);
  } catch (error) {
    return next(new HttpError("error while fetching place with given id", 500));
  }

  if (place.creator.toString() !== request.userData.userId)
    return next(
      new HttpError("this user is not allowed to edit this place", 401)
    );

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(new HttpError("updating place failed", 500));
  }

  response.status(200).json({ place: place.toObject({ getters: true }) });
};

exports.deletePlace = async (request, response, next) => {
  const id = request.params.id;

  let place;
  try {
    place = await Place.findById(id).populate("creator");
  } catch (error) {
    return next(new HttpError("error while fetching place with given id", 500));
  }

  if (!place)
    return next(new HttpError("couldn't find place with given id", 500));

  if (place.creator.id !== request.userData.userId)
    return next(
      new HttpError("this user is not allowed to delete this place", 401)
    );

  const imagePath = place.image;

  try {
    /*const session = await startSession();
    session.startTransaction();
    await place.deleteOne({ session: session });
    place.creator.places.pull(place);
    await place.creator.save({ session });
    await session.commitTransaction();*/
    await place.deleteOne();
    place.creator.places.pull(place);
    await place.creator.save();
  } catch (error) {
    return next(new HttpError("deleting place failed", 500));
  }

  fs.unlink(imagePath, error => console.log(error));

  response.status(200).json({ message: "place deleted" });
};
