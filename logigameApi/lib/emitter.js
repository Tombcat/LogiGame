'use strict'

const mq = require("mqemitter");
const emitter = mq({ concurrency: 5 });


/*myEmitter.on('test', (res) => {
    console.log('worked!');
});*/


module.exports = {
	emitter
}