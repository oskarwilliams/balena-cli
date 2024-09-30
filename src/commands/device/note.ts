/**
 * @license
 * Copyright 2016-2020 Balena Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Flags, Args, Command } from '@oclif/core';
import { ExpectedError } from '../../errors';
import * as cf from '../../utils/common-flags';
import { getBalenaSdk, stripIndent } from '../../utils/lazy';

export default class DeviceNoteCmd extends Command {
	public static aliases = ['notes'];
	public static deprecateAliases = true;

	public static description = stripIndent`
		Set a device note.

		Set or update a device note. If the note argument is not provided,
		it will be read from stdin.

		To view device notes, use the \`balena device <uuid>\` command.
	`;

	public static examples = [
		'$ balena device note "My useful note" --device 7cf02a6',
		'$ cat note.txt | balena device note --device 7cf02a6',
	];

	public static args = {
		note: Args.string({
			description: 'note content',
		}),
	};

	public static flags = {
		device: { exclusive: ['dev'], ...cf.device },
		dev: Flags.string({
			exclusive: ['device'],
			hidden: true,
		}),
	};

	public static authenticated = true;

	public async run() {
		const { args: params, flags: options } = await this.parse(DeviceNoteCmd);

		if (params.note?.length === 0) {
			throw new ExpectedError('Missing note content');
		}

		options.device = options.device || options.dev;
		delete options.dev;

		if (options.device == null || options.device.length === 0) {
			throw new ExpectedError('Missing device UUID (--device)');
		}

		const balena = getBalenaSdk();

		return balena.models.device.setNote(options.device, params.note ?? '');
	}
}
