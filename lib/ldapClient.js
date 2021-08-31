const ldap = require('ldapjs');
const config = require('./config');

/**
 * Creates and return an LDAP connection
 * @param {string} type - 'ou' for groups or 'ad' for people
 */
const createClient = (type) => {
  let host;
  if (type == 'ou') {
    host = config.AD_GROUPS_HOST;
  }
  if (type === 'ad') {
    host = config.AD_PEOPLE_HOST;
  }
  const client = ldap.createClient({
    url: [`ldap://${host}`],
  });

  client.bind(config.AD_USER, config.AD_PASS, (err) => {
    if (err) {
      console.error('Bind error', err);
    }
  });

  return client;
};

const createChange = (options) => {
  return new ldap.Change(options);
};

function searchAsync(client, base, options) {
  return new Promise((resolve, reject) => {
    client.search(base, options, function (err, res) {
      if (err) {
        console.error(err);
        reject(new Error('Error retrieving users from Active Directory'));
      } else {
        const entries = [];
        res.on('searchEntry', function (entry) {
          entries.push(entry);
        });
        res.on('searchReference', function (referral) {
          console.log('referral: ' + referral.uris.join());
        });
        res.on('error', function (err) {
          console.error('error: ' + err.message);
        });
        res.on('end', function (result) {
          console.log('status: ' + result.status);
          if (result.status !== 0) {
            reject(new Error('Error code received from Active Directory'));
          } else {
            resolve(entries);
          }
        });
      }
    });
  });
}

module.exports = {
  createChange,
  createClient,
  searchAsync,
};
