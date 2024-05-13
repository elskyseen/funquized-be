export const genUrlImage = (protocol, host, port, dir, hash, name) => {
  return `${protocol}://${host}:${port}/${dir}/${hash}-${name}`;
};
