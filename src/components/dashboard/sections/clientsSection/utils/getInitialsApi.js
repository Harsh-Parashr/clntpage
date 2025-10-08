import getInitials from './getInitials';

const getInitialsApi = (name, delay = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getInitials(name));
    }, delay);
  });
};

export default getInitialsApi;
