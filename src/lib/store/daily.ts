import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { getDefault } from '../utils/getDefault';
import type { Base, Task } from '../utils/interface';

const KEY = 'daily';
const LAST_UPDATE = '2023-07-07T04:34:21.229Z';

const dailyDefault: Base = {
	Time: new Date(),
	Value: [
		{
			name: 'Bounty',
			type: 'number',
			value: 0,
			max: 4
		},
		{
			name: 'Training',
			type: 'number',
			value: 0,
			max: 2
		},
		{
			name: 'Mirroria Fun Zone',
			type: 'number',
			value: 0,
			max: 8
		},
		{
			name: 'Artificial Island Resource',
			type: 'boolean',
			value: false,
			label: 'Claim'
		},
		{
			name: 'Gift',
			type: 'booleanList',
			value: [false, false],
			label: ['[Aesperia] Banges: Black Market', '[Aesperia] Navia: Cetus Island']
		},
		{
			name: 'Support Points',
			type: 'numberWithButtons',
			value: 0,
			max: 1500,
			buttons: [100, 150, 250, 375, 500]
		},
		{
			name: 'Return Support Points',
			type: 'numberWithButtons',
			value: 0,
			max: 600,
			buttons: [50, 100]
		}
	]
};

export const daily = writable(getDefault(KEY, dailyDefault, new Date(LAST_UPDATE)));

if (browser) {
	daily.subscribe((value) => window.localStorage.setItem(KEY, JSON.stringify(value)));
}