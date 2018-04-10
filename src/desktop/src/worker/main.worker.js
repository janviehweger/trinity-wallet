import 'babel-polyfill';
import { generateNewAddress } from 'actions/wallet';
import { getAccountInfo, getFullAccountInfoFirstSeed, getFullAccountInfoAdditionalSeed } from 'actions/accounts';
import { changeIotaNode } from 'libs/iota';
import { defaultNode } from 'config';

let state = {
    settings: {
        node: defaultNode,
    },
};

const actions = {
    generateNewAddress,
    getAccountInfo,
    getFullAccountInfoFirstSeed,
    getFullAccountInfoAdditionalSeed,
};

const dispatch = (action) => {
    if (typeof action === 'function') {
        action(dispatch, getState);
    } else {
        self.postMessage({
            type: 'dispatch',
            action,
        });
    }
};

const getState = () => {
    return state;
};

self.onmessage = ({ data }) => {
    const { type, payload } = data;

    switch (type) {
        case 'setState':
            if (state.settings.node !== payload.settings.node) {
                changeIotaNode(payload.settings.node);
            }
            state = payload;
            break;
        default:
            if (type === 'getFullAccountInfoAdditionalSeed') {
                payload.push(async (password, seed, accountName) => {
                    self.postMessage({
                        type: 'saveSeed',
                        payload: {
                            password,
                            seed,
                            accountName,
                        },
                    });
                });
            }

            if (typeof actions[type] === 'function') {
                actions[type](...payload)(dispatch, getState);
            }
    }
};
