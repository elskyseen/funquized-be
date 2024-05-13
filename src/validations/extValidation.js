import { acceptedImage } from "../utils/variable.js";

export const extValidation = (ext) => {
  return !acceptedImage.includes(ext);
};
