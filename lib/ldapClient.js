const { Client, Change, Attribute } = require('ldapts');
const config = require('./config');

/**
 * Creates and return an LDAP connection
 * @param {string} type - 'ou' for groups or 'ad' for people
 */
const createConnection = async (type) => {
  let host;
  if (type === 'ou') {
    host = config.AD_GROUPS_HOST;
  }
  if (type === 'ad') {
    host = config.AD_PEOPLE_HOST;
  }
  const client = new Client({
    url: `ldaps://${host}:${config.AD_PORT}`,
    tlsOptions: {
      rejectUnauthorized: false,
    },
  });

  await client.bind(config.AD_USER, config.AD_PASS);

  return client;
};

/**
 * Returns an LDAP.Change object for modify operation
 * @param {string} action - 'add', 'replace', 'delete'
 * @param {string} type - attribute property to modify e.g. 'member', 'description'
 * @param {array} values - array of values
 */
const createChange = (action, type, values) => {
  const options = {
    operation: action,
    modification: new Attribute({
      type,
      values,
    }),
  };

  return new Change(options);
};

module.exports = {
  createChange,
  createConnection,
};
