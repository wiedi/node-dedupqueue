/* todo: real tests ;-) */
var DedupQueue = require('./dedupqueue')

function worker(task, cb) {
	setTimeout(function() {
		console.log("Worker: " + task)
		cb(false, task)
	}, task)
}

var q = new DedupQueue(worker, 2)

q.push(6000, console.log)
q.push(2000, console.log)
q.push(3000, console.log)
q.push(6000, console.log)
q.push(5000, console.log)
setTimeout(function() {
	q.push(6000, console.log)
}, 7000)