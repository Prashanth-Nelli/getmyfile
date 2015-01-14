#!usr/bin/env node

var request   = require("request");
var url       = require('url');
var path      = require('path');
var fs        = require('fs');
var Transform = require('stream').Transform;
var util      = require('util');

util.inherits(Notify, Transform);

var fileSize     = 0;
var noOfChunks   = 0;
var totalPercent = 0;

var arguments    = Array.prototype.slice.call(process.argv);

function Notify() {
	Transform.call(this);
}

Notify.prototype._transform = function(data, encoding, callback) {
	totalPercent = Math.floor(((noOfChunks += data.length) / fileSize) * 100);
	if (totalPercent == 100) {
		process.stdout.write("Downloaded " + totalPercent + ' %' + '\n');
	} else {
		process.stdout.write("Downloaded " + totalPercent + ' %' + '\r');
	}
	callback(null, data);
}
var notify = new Notify();

function get(filepath) {
	request.get(filepath).on('error', function(err) {
		console.log(err);
	}).on('response', function(response) {
		fileSize = response.headers["content-length"];
	}).pipe(notify).pipe(fs.createWriteStream(process.cwd() + '/' + path.basename(filepath)));
}

get(transform(arguments[2]));

function transform(filepath) {
	var link = url.parse(filepath);
	if (link.protocol) {
		if (link.pathname.charAt(0) == '/') {
			return link.protocol + "//" + link.host + link.pathname.slice(1);
		} else {
			return link.protocol + "//" + link.host + link.pathname;
		}
	} else {
		if (link.pathname.charAt(0) == '/') {
			return "http://" + link.pathname.slice(1);
		} else {
			return "http://" + link.pathname;
		}
	}
}

