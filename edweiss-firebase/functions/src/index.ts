
import admin = require('firebase-admin');
admin.initializeApp();

import { createAccount } from './functions/createAccount';
import { helloWorld } from './functions/helloWorld';
import { createDeck } from './functions/memento/createDeck';

exports.createAccount = createAccount;

exports.helloWorld = helloWorld;
exports.createDeck = createDeck;
