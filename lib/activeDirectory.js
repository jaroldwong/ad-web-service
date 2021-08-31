const config = require('./config');
const groupTypes = require('./constants/groupTypes');
const ldapClient = require('./ldapClient');

async function getUser(loginId) {
  const conn = await ldapClient.createConnection('ad');
  const baseDn = config.AD_PEOPLE_BASE;
  const options = {
    filter: `(cn=${loginId})`,
    scope: 'sub',
  };

  try {
    const result = await conn.search(baseDn, options);
    return result.searchEntries[0];
  } finally {
    conn.unbind();
  }
}

async function getGroup(groupName) {
  const conn = await ldapClient.createConnection('ou');
  const baseDn = config.AD_GROUPS_BASE;
  const options = {
    filter: `(cn=${groupName})`,
    scope: 'sub',
    attributes: ['member'],
  };

  try {
    const result = await conn.search(baseDn, options);
    return result.searchEntries[0];
  } finally {
    conn.unbind();
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

  const change = ldapClient.createChange('add', 'member', [adUser.dn]);

  const conn = await ldapClient.createConnection('ou');
  await conn.modify(adGroup.dn, change);
  conn.unbind();
}

async function removeUserFromGroup(loginId, groupName) {
  const adGroup = await getGroup(groupName);
  const adUser = await getUser(loginId);

  const change = ldapClient.createChange('delete', 'member', [adUser.dn]);

  const conn = await ldapClient.createConnection('ou');
  await conn.modify(adGroup.dn, change);
  conn.unbind();
}

async function createGroup(groupName) {
  const conn = await ldapClient.createConnection('ou');
  const testDn =
    'OU=LS-OU-TEST,OU=LS,OU=DEPARTMENTS,DC=OU,DC=AD3,DC=UCDAVIS,DC=EDU';

  const cn = groupName.toUpperCase();
  const dn = `CN=${cn},${testDn}`;

  const entry = {
    cn: cn,
    objectClass: ['top', 'group'],
    description: 'test group created by web service',
    samaccountname: cn,
    objectCategory:
      'CN=Group,CN=Schema,CN=Configuration,DC=ad3,DC=ucdavis,DC=edu',
    groupType: groupTypes.UNIVERSAL_SECURITY,
  };

  await conn.add(dn, entry);
}

async function deleteGroup(groupName) {
  const adGroup = await getGroup(groupName);
  const conn = await ldapClient.createConnection('ou');
  await conn.del(adGroup.dn);
}

// updateGroupDescription

module.exports = {
  getEmailsFromGroup,
  getEmailFromLogin,
  addUserToGroup,
  removeUserFromGroup,
  createGroup,
  deleteGroup,
};
