import initialClients from './initialClients';

// Simulate API delay for fetching initial clients
function getInitialClientsApi(delay = 1200) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(initialClients);
    }, delay);
  });
}

export default getInitialClientsApi;
