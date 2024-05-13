export const sizeValidation = (size) => {
  // max size 5MB
  const maxSize = 5 * 1024 * 1024;
  return size > maxSize ? true : false;
};
