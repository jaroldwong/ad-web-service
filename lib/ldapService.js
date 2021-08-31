// const config = require('./config');
// const ldapClient = require('./ldapClient');

// const searchGroups = async (cn) => {
//   const client = ldapClient.createClient('ou');
//   const baseDn = config.AD_GROUPS_BASE;
//   const options = {
//     filter: `(cn=${cn})`,
//     scope: 'sub',
//   };

//   try {
//     return await ldapClient.searchAsync(client, baseDn, options);
//   } finally {
//     client.unbind();
//   }
// };

// const searchPeople = async (cn) => {
//   const client = ldapClient.createClient('ad');
//   const baseDn = config.AD_PEOPLE_BASE;
//   const options = {
//     filter: `(cn=${cn})`,
//     scope: 'sub',
//   };

//   try {
//     return await ldapClient.searchAsync(client, baseDn, options);
//   } finally {
//     client.unbind();
//   }
// };

// const addUserToGroup = async (user, group) => {
//   const existingGroup = await searchGroups(group);
//   const groupDn = existingGroup[0].objectName;

//   const existingUser = await searchPeople(user);
//   const userDn = existingUser[0].objectName;

//   const change = ldapClient.createChange({
//     operation: 'add',
//     modification: {
//       member: userDn,
//     },
//   });

//   const client = ldapClient.createClient('ou');

//   client.modify(groupDn, change, (err) => {
//     if (err) {
//       console.error(err);
//     }
//     client.unbind();
//   });
// };

// const removeUserFromGroup = async (user, group) => {
//   const existingGroup = await searchGroups(group);
//   const groupDn = existingGroup[0].objectName;

//   const existingUser = await searchPeople(user);
//   const userDn = existingUser[0].objectName;

//   const change = ldapClient.createChange({
//     operation: 'delete',
//     modification: {
//       member: userDn,
//     },
//   });

//   const client = ldapClient.createClient('ou');

//   client.modify(groupDn, change, (err) => {
//     if (err) {
//       console.error(err);
//     }
//     client.unbind();
//   });
// };

// module.exports = {
//   searchGroups,
//   searchPeople,
//   addUserToGroup,
//   removeUserFromGroup,
// };
