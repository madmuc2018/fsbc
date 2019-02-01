const blockchainController = require('../blockchain/controller');
const mongodb = require('./mongodb');
const ipfs = require('./ipfs');
const env = require('dotenv').config();
const utils = require('../utils');

if (env.error) {
  throw env.error;
}

// this is idempotent, feel free to run many times
async function restore() {
  utils.logger.info(`Running restore`);

  const errors = [];
  const pushError = (errors, type, id, error) => errors.push(`<RESTORE> Could not restore ${type} ${id}, error: ${error}`);

  const participants = await mongodb.getParticipants();
  const dataAssets = await mongodb.getDataAssets();
  const datas = await mongodb.getDatas();

  for (const {username, role, salt, hashedPassword} of participants) {
    try {
      await blockchainController.registerParticipant(username, role, salt, hashedPassword);
    } catch (error) {
      // if (!(error.message && error.message === 'Email already registered')) {
      //   pushError(errors, 'participant', username, error);
      // } else {
      //   throw error;
      // }
      pushError(errors, 'participant', username, error);
    }
  }

  for (const {guid,originalName,mimetype,lastChangedAt,active,owner,lastChangedBy,authorizedUsers,lastVersion} of dataAssets) {
    try {
      await blockchainController.postDataFull(guid,originalName,mimetype,lastChangedAt,active,owner,lastChangedBy,authorizedUsers,lastVersion);
    } catch (error) {
      pushError(errors, 'dataAsset', guid, error);
    }
  }

  for (const {guid,data} of datas) {
    try {
      await ipfs.postData(data);
    } catch (error) {
      pushError(errors, 'data', guid, error);
    }
  }

  utils.logger.info('Restore complete!');
}

restore();