
import admin = require('firebase-admin');
admin.initializeApp();

import { helloWorld } from './functions/helloWorld';
import { createDeck } from './functions/memento/createDeck';

exports.helloWorld = helloWorld;
exports.createDeck = createDeck;
