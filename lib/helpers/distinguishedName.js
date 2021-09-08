/**
 * @param {string} distinguishedName - "CN=*,OU=ucdUsers,DC=ad3,DC=ucdavis,DC=edu"
 * @returns {boolean} Returns true if distinguishedName is an AD user
 */
exports.isAdUser = function isAdUser(dn) {
  return dn.split(',')[1] === 'OU=ucdUsers';
};

/**
 * Strips commonName from distinguishedName
 * @param {string} distinguishedName - "CN=john,OU=ucdUsers,DC=ad3,DC=ucdavis,DC=edu"
 * @returns {string} commonName - "john"
 */
exports.getCnFromDn = function getCnFromDn(dn) {
  return dn.match(/CN=([^,]+)/)[1];
};
