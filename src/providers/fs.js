/*
 * Copyright (c) 2013, Vialink Informática. All rights reserved.
 *
 * This file is part of ViaCRYPT.
 *
 * ViaCRYPT is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * ViaCRYPT is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with ViaCRYPT.  If not, see <http://www.gnu.org/licenses/>.
 */

var fs = require('fs');
var message = require('../parser').message;
var parse = require('../parser').parse;

var Provider = function(options){
	var messages_path = options.messages_path;
	// ensure dir exists
	if (!fs.existsSync(messages_path)) {
		fs.mkdirSync(messages_path);
	}

	if (messages_path == null) {
		console.log('WARNING: implicit messages path is being deprecated, please configure one!');
		messages_path = 'messages/';
	}
	// check if given path is absolute
	if (messages_path.substr(0, 1) === '/') {
		this.messages_path = messages_path;
	} else {
		this.messages_path = __dirname + '/../' + messages_path;
	}
	// ensure path ends with '/'
	if (this.messages_path.substr(-1, 1) !== '/') {
		this.messages_path += '/';
	}
};

Provider.prototype.make_path = function(id) {
	return this.messages_path + id;
};

Provider.prototype.get = function (id, callback) {
	var path = this.make_path(id);
	fs.readFile(path, function(err, data) {
		if (err) {
			callback(err);
		} else {
			callback(err, parse(data.toString()));
			// delete the file
			fs.unlink(path);
		}
	});
};

Provider.prototype.put = function (id, data, callback) {
	var path = this.make_path(id);
	fs.exists(path, function(exists) {
		if (exists) {
			callback('duplicate');
		} else {
			var raw_data = message(data);
			fs.writeFile(path, raw_data, function(err) {
				if (err) {
					var error = (function () {
						//TODO list known treatable errors.
						switch(err) {
						default: return 'unkown';
						}
					})();
					callback(error);
				} else {
					callback();
				}
			});
		}
	});
};

exports.Provider = Provider;
