// shared timers for the game

// game intervals {game_id: interval}

const emitter = require('./emitter').emitter

const Model = require('../models/init')

async function gameStatusChanged(gameId, game,){
	//Inform connected websocket clients that game status have changed, send payload with game progress

	//io.emit('gameStatusChanged')
	emitter.emit({
	  topic: "gameStatusChanged",
	  meta: "game-status-changed",
	  gameId,
	  payload: {
		status: game.status, 
		interval: game.interval, 
		remaining: await remaining(game) ?? 0, 
		timeEndAt: Date.now() + await remaining(game) ?? 0,
		currentMonth: game.currentMonth, 
		currentStage: game.currentStage
	  }
	});
  }


function IntervalTimer(callback, interval) {
        let timerId, startTime, remaining = 0;
        let state = 0; //  0 = idle, 1 = running, 2 = paused, 3= resumed, 4= stopped (clear)

        this.pause = function () {
            if (state != 1) return;
            remaining = interval - (new Date() - startTime);
            clearInterval(timerId);
            state = 2;
        };

        this.resume = function () {
            if (state != 2) return;
            startTime = new Date(new Date() - interval + remaining)
            state = 3;
            setTimeout(this.timeoutCallback, remaining);
        };

        this.timeoutCallback = function () {
            if (state != 3) return;

            callback();

            startTime = new Date();
            timerId = setInterval(callback, interval);
            state = 1;
        };

        this.clear = function(){
        	if(timerId){
        		clearInterval(timerId)
        		state = 4
        	}
        }

        this.remaining = function(){
        	if (state == 4) // stopped
        		return 0
        	if(state != 2)
        		return interval - (new Date() - startTime);
        	else 
        		return remaining
        }

        this.reset= function(){
        	startTime = new Date()
        }

        startTime = new Date();
        timerId = setInterval(callback, interval);
        state = 1;
}

const intervals = {}

async function processNext(game){
	let numMonths = await Model.periods.find({game: game.id}).countDocuments()
	game.currentStage = (game.currentStage + 1)%4;
	if(game.currentStage == 0){
		if(game.currentMonth < numMonths-1){
			game.currentMonth =  game.currentMonth+1;
			
		}else{
			game.currentStage = 3
			//game.currentMonth = 0;
			game.status = 'ended';
			timer(game).clear()
		}
	}
	timer(game).reset()
	await game.save()

	gameStatusChanged(game.id, game)
}



async function restart(game,interval, month,stage){
	// restart month , month index should start with 1
	game.currentMonth = parseInt(month)-1;
	game.currentStage = parseInt(stage)-1;
	game.interval = interval || game.interval;
	game.status = 'running'
	await game.save()
	init(game)
	gameStatusChanged(game.id, game)
}

async function pause(game){
	// pause game
	game.status = 'paused'
	await game.save()
	timer(game).pause()
	gameStatusChanged(game.id, game)
}

async function resume(game){
	game.status = 'running'
	await game.save()
	timer(game).resume()
	gameStatusChanged(game.id, game)
}


async function stop(game){
	// reset params and stop game
	game.status = "stopped"
	game.currentMonth = 0;
	game.currentStage = 0;
	await game.save()
	timer(game).clear()
	gameStatusChanged(game.id, game)
	
}

async function remaining(game){
	return timer(game).remaining()
}


function init(game){
	if(intervals[game.id] && intervals[game.id].timer){
		intervals[game.id].timer.clear()
	}
	intervals[game.id] = {     // processNext next month or next stage
		timer: new IntervalTimer(()=>{processNext(game,game.currentStage,game.currentMonth)}, game.interval*1000),
	}
}

// fetch timer 
function timer(game){
	if (!intervals[game.id] || !intervals[game.id].timer) {
		//If there is no Interval with requested game ID create new one
		intervals[game.id] = {     // processNext next month or next stage
			timer: new IntervalTimer(()=>{processNext(game,game.currentStage,game.currentMonth)}, game.interval*1000),
		}	
	}
	return intervals[game.id].timer
}

async function start(game,interval){
	game.currentMonth = 0;
	game.currentStage = 0;
	game.status = 'running';
	game.interval = interval;
	await game.save()
	init(game)
	gameStatusChanged(game.id, game)
}



module.exports = {
	start,
	stop,
	restart,
	pause,
	resume,
	remaining,
}