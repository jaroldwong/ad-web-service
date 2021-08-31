require('dotenv').config();
const app = require('express')();
const PORT = 5000;

const ad = require('./lib/activeDirectory');

app.post('/groups/:groupCn', (req, res) => {
  ad.createGroup(req.params.groupCn).then(() => {
    res.status(201).send();
  });
});

app.delete('/groups/:groupCn', (req, res) => {
  ad.deleteGroup(req.params.groupCn).then(() => {
    res.status(204).send();
  });
});

app.get('/groups/:groupCn', (req, res) => {
  ad.getEmailsFromGroup(req.params.groupCn).then((members) => {
    res.set({
      'Content-type': 'text/plain',
    });
    res.send(members.join('\n'));
  });
});

app.put('/groups/:groupCn/users/:userCn', (req, res) => {
  const group = req.params.groupCn;
  const user = req.params.userCn;

  ad.addUserToGroup(user, group).then(() => {
    res.status(204).send();
  });
});

app.delete('/groups/:groupCn/users/:userCn', (req, res) => {
  const group = req.params.groupCn;
  const user = req.params.userCn;

  ad.removeUserFromGroup(user, group).then(() => {
    res.status(204).send();
  });
});

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
