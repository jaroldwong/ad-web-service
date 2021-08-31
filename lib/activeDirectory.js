const config = require('./config');
const ldapClient = require('./ldapClient');

// const ldapTs = require('ldapts');
// const client = new ldapTs.Client({
//   url: `ldap://${config.config.AD_GROUPS_HOST}`,
// });
// client.bind(config.AD_USER, config.AD_PASS);

// const opts = {
//   filter: '(mail=cwjwong@ucdavis.edu)',
//   scope: 'sub',
//   // attributes: ['dn', 'sn', 'cn'],
// };

// ldapts
// const { searchEntries } = await client.search(config.AD_GROUPS_BASE, opts);
// return searchEntries[0].member.map((dn) => dn.match(/CN=([^,]+)/)[1]);

// cn = common name
// dn = full distinguished name

async function getUser(loginId) {
  const client = ldapClient.createClient('ad');
  const baseDn = config.AD_PEOPLE_BASE;
  const options = {
    filter: `(cn=${loginId})`,
    scope: 'sub',
  };

  try {
    const result = await ldapClient.searchAsync(client, baseDn, options);
    return result[0].object;
  } finally {
    client.unbind();
  }
}

async function getGroup(groupName) {
  const client = ldapClient.createClient('ou');
  const baseDn = config.AD_GROUPS_BASE;
  const options = {
    filter: `(cn=${groupName})`,
    scope: 'sub',
    attributes: ['member'],
  };

  try {
    const result = await ldapClient.searchAsync(client, baseDn, options);
    return result[0].object;
  } finally {
    client.unbind();
  }
}
async function getMembersFromGroup(groupName) {
  const adGroup = await getGroup(groupName);
  return adGroup.member;
}

async function getEmailsFromGroup(cn) {
  const members = await getMembersFromGroup(cn);
  const logins = members.map((dn) => dn.match(/CN=([^,]+)/)[1]);

  const emails = await Promise.all(
    logins.map((login) => getEmailFromLogin(login))
  );

  return emails;
}

async function getEmailFromLogin(cn) {
  const user = await getUser(cn);
  return `${user.mail} ${user.displayName}`;
}

async function addUserToGroup(loginId, groupName) {
  const adGroup = await getGroup(groupName);
  const adUser = await getUser(loginId);

  const change = ldapClient.createChange({
    operation: 'add',
    modification: {
      member: adUser.dn,
    },
  });

  const client = ldapClient.createClient('ou');

  client.modify(adGroup.dn, change, (err) => {
    if (err) {
      console.error(`${err.name}: ${err.message}`);
    }
    client.unbind();
  });
}

async function removeUserFromGroup(loginId, groupName) {
  const adGroup = await getGroup(groupName);
  const adUser = await getUser(loginId);

  const change = ldapClient.createChange({
    operation: 'delete',
    modification: {
      member: adUser.dn,
    },
  });

  const client = ldapClient.createClient('ou');

  client.modify(adGroup.dn, change, (err) => {
    if (err) {
      console.error(err);
    }
    client.unbind();
  });
}

// updateGroupDescription

module.exports = {
  getEmailsFromGroup,
  getEmailFromLogin,
  addUserToGroup,
  removeUserFromGroup,
};
