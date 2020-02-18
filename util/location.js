const axios = require("axios");

const HttpError = require("../model/httpError");

const getCoordinatesForAddress = async address => {
  let response;
  try {
    response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}&key=${process.env.GOOGLE_API_KEY}`
    );
  } catch (error) {
    console.log(error);
  }

  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS")
    throw new HttpError("couldn't find location for the given address", 422);

  return data.results[0].geometry.location;
};

/*const getCoordinatesForAddress = address => {
  return {
    lat: 40.7484474,
    lng: -73.9871516
  };
};*/

module.exports = getCoordinatesForAddress;
