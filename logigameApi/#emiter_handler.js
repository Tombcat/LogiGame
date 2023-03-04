const emitterFile = require('./app.js');
const myEmitter = emitterFile.emitter;

console.log("why")
console.log(myEmitter)
myEmitter.emit('test');