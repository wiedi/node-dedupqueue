"use strict"

var EventEmitter = require('events').EventEmitter
var util = require('util')

function DedupQueue(worker, concurrency) {
	EventEmitter.call(this)
	this.setMaxListeners(0)
	
	this.tasks = []
	this.keys  = {}
	
	this.concurrency = concurrency || 3
	this.worker      = worker
	this.workers     = 0
	
	return this
}

util.inherits(DedupQueue, EventEmitter)

DedupQueue.prototype.push = function(key, callback) {
	var self = this
	
	this.once("done:" + key, callback)
	if(!this.keys.hasOwnProperty(key)) {
		this.tasks.push(key)
		this.keys[key] = true		
	}

	if(this.tasks.length === this.concurrency) {
		this.emit("saturated")
	}
	setImmediate(function() {
		self.process()		
	})

}

DedupQueue.prototype.process = function() {
	var self = this
	
	if(this.workers > this.concurrency || this.tasks.length < 1) {
		return
	}
	console.log(this.workers , this.concurrency , this.tasks.length)
	var task = this.tasks.shift()
	if(this.tasks.length === 0) {
		this.emit("empty")
	}
	
	this.workers++
	this.worker(task, function(err, result) {
		self.workers--
		delete self.keys[task]
		self.emit("done:" + task, err, result)
		if(self.tasks.length + self.workers < 1) {
			self.emit("drain")
		}
		self.process()
	})
}

module.exports = DedupQueue