export const validateImage = (image) => {
    return image && image.public_id && image.secure_url;
  };
  
  export const validateLocation = (location) => {
    return location && location.street && location.province && location.city;
  };
  
  export const validateEsewaId = (esewaId) => {
    return esewaId && esewaId.length === 10;
  };
  