'use strict'

// Production model

const Model = require('../../models/init')
const Util = require('../../lib/utils')

const productionProperties = {
	Prod_Cap: { type: 'number' , description: "Monthly Max Production Capacity"},
    LeadProd: { type: 'number', description: "Production leadtime in months" },
    VarProd: { type: 'number', description: "Variability penalty in (%)" },
    UProd_Cost: { type: 'number', description: "Per unit production cost" },
    UProd_Em: { type: 'number', description: "Per unit production emission" },
    InvtWPB_0: { type: 'number', description: "Inventory level to start with" },
    WP_Cap: { type: 'number', description: "Production Warehouse Maximum Storage Capacity" },
    UHoldWP_Cost: { type: 'number', description: "Per unit/per month holding cost at production warehouse" },
    UHoldWP_Em: { type: 'number', description: "Per unit/per month emission unit at production warehouse" },
    
}

module.exports = function (fastify, opts, next) {
  // fastify.post('/production/:game_id/inputs',{
  //     schema: {
  //       description: 'Set production inputs',
  //       tags: ['production'],
  //       summary: 'Setup production inputs',
  //       params:{
  //       	type: 'object',
  //       	properties: {
  //           game_id: { type: 'string' , description: "Game ID"},
	 //      	}
  //       },
  //       body: {
  //         type: 'object',
  //         properties: productionProperties
          
  //       },
  //       response: {
  //         200: {
  //           description: 'Successful response',
  //           type: 'object',
  //           properties: {
  //             production: { type: 'object', properties: {id: {type: 'string'}} },
  //             success: { type: 'boolean' }
  //           }
  //         }
  //       }
      
  //     }
  //   },
  //   async function (req, res) {
  //     let productionProps = req.body;
	 //  	let production = await Model.productions.findOneAndUpdate({game: req.params.game_id},{$set: productionProps},{upsert: true, new: true})
	 //  	res.send({success: true, production: production})
 	//  })


  // fastify.get('/production/:game_id/inputs',{
  //     schema: {
  //       description: 'Get production inputs with game-id in params',
  //       tags: ['production'],
  //       summary: 'Get production inputs',
  //       params: {
  //         type: 'object',
  //         properties: {
  //           game_id: { type: 'string' , description: "Game ID"},
	 //      	}
          
  //       },
  //       response: {
  //         200: {
  //           description: 'Successful response',
  //           type: 'object',
  //           properties: {
  //             production: { type: 'object', properties: Object.assign(productionProperties,{  game: { type: 'string', description: "Game ID" }, _id: { type: 'string', description: "Production ID" }}) },
  //             success: { type: 'boolean' }
  //           }
  //         }
  //       }
      
  //     }
  //   },
  //   async function (request, reply) {
	 //  	let production = await Model.productions.findOne({game: request.params.game_id})
	 //  	reply.send({success: true, production: production})
 	//  })

	
  fastify.post('/:team/:game_id/:month',{
      schema: {
        description: 'Post player (team) production Qt for the month index (month == currentMonth)',
        tags: ['production'],
        summary: 'Send player Qt value for the month',
        params: {
          type: 'object',
          properties: {
            game_id: { type: 'string' , description: "Game ID"},
            month: { type: 'number' , description: "Month index"},
            team: { type: 'string' , description: "Team Name"}
	      }
          
        },
        body: {
        	type: 'object',
        	properties: {
        		Qt: {type: 'number'}
        	}
        },
        response: {
          200: {
            description: 'Successful response, return productionPlayer inventory values',
            type: 'object',
            properties: {
              production: { type: 'object', 
              	properties: {
	              	Qt: {type: 'number'}, 
	              	InvtWPB_i: {type: 'number'}, 
	              	InvtWPE_i: {type: 'number'}
              	}
              },
              success: { type: 'boolean' },
              message: { type: 'string' }
            }
          }
        }
      
      }
    },
    async function (req, res) {
      // game months
      // fetch months (periods) for the game
      let months = await Model.periods.find({game: req.params.game_id}).sort('index') 
      let month = months.find(m => m.index == req.params.month) 
      let prevMonth = months.find(m => m.index == req.params.month-1) 
      let production = await Model.productions.findOne({game: req.params.game_id})
      // check month is current month
      let playerProduction = await Model.playerProductions.findOneAndUpdate({team: req.params.team,month: month._id},{},{upsert: true, new: true})
      let prevPlayerProduction = prevMonth ? await Model.playerProductions.findOne({team: req.params.team, month: prevMonth._id}) : null;
      let InvtWPB_i = playerProduction.InvtWPB_i!==undefined ? playerProduction.InvtWPB_i  : (prevPlayerProduction ? prevPlayerProduction.InvtWPE_i : production.InvtWPB_0);
      console.log("InvtWPB_i ... ",InvtWPB_i)
      console.log("playerProduction.InvtWPB_i ... ",playerProduction.InvtWPB_i)
      console.log("production.InvtWPB_0 ... ",production.InvtWPB_0)
      //let pQt = playerProduction.Qt || 0;
      //playerProduction = await Model.playerProductions.findOneAndUpdate({month: month._id,team: req.params.team},{$set: {Qt: req.body.Qt, InvtWPB_i: InvtWPB_i, InvtWPE_i: (InvtWPB_i+req.body.Qt)}},{upsert: true, new: true})
      if(req.body.Qt+InvtWPB_i > production.WP_Cap){
        res.send({success: false, message: "Can't produce this quantity, Warehouse capacity is limited to : "+production.WP_Cap});
        return;
      }
      if(req.body.Qt > production.Prod_Cap){
        res.send({success: false, message: "Can't produce this quantity, Production capacity is limited to : "+production.Prod_Cap});
        return;
      }
      
      playerProduction = await Model.playerProductions.findOneAndUpdate({month: month._id,team: req.params.team},{$set: {Qt: parseInt(req.body.Qt)}},{upsert: true, new: true})
      // recalculate inventories ...
      await Util.recalculateInventory({game_id: req.params.game_id,months: months,team: req.params.team})
      res.send({success: true, production: playerProduction})
 	 })


/*  fastify.post('/production/plan/:team/:game_id/:month',{
      schema: {
        description: 'Post player production Qt Plan for the month index (month > currentMonth)',
        tags: ['production'],
        summary: 'Send player Qt Plan value for the month',
        params: {
          type: 'object',
          properties: {
            game_id: { type: 'string' , description: "Game ID"},
            month: { type: 'number' , description: "Month index"},
            team: { type: 'string' , description: "Team Name"}
	      }
          
        },
        body: {
        	type: 'object',
        	properties: {
        		Qt_Plan: {type: 'number'}
        	}
        },
        response: {
          200: {
            description: 'Successful response, return productionPlayer inventory values',
            type: 'object',
            properties: {
              production: { type: 'object', 
              	properties: {
	              	Qt: {type: 'number'}, 
	              	InvtWPB_i: {type: 'number'}, 
                  InvtWPE_i: {type: 'number'},
                  InvtWPB_i_Plan: {type: 'number'},
	              	InvtWPE_i_Plan: {type: 'number'},
              	}
              },
              success: { type: 'boolean' }
            }
          }
        }
      
      }
    },
    async function (req, res) {
    	// TODO implement
      let months = await Model.periods.find({game: req.params.game_id}) 
      let month = months.find(m => m.index == req.params.month) 
      let production = await Model.productions.findOne({game: req.params.game_id})
      // check month is current month
      //if(Util.compareMonth(month.start) === 0){
      let playerProductions = await Model.playerProductions.find({team: req.params.team}).sort('created').populate('month')
      let InvtWPB_i_Plan = production.InvtWPB_0;
      let playerProduction = await Model.playerProductions.findOneAndUpdate({month: month._id,team: req.params.team},{$set: {Qt_Plan: req.body.Qt_Plan}},{upsert: true,new: true})
      // update or create player production 
      if(playerProductions && playerProductions.length > 0){

        let playerProductionIndex = playerProductions.findIndex(pp => pp.month.index==req.params.month)
      
        let startIndex = playerProductionIndex;
        // console.log("InvtWPB_0_Plan .. ")
        for (var i = startIndex; i <  playerProductions.length; i++) {
            let InvtWPB_i_Plan_Month = i>0 ? playerProductions[i-1].InvtWPE_i_Plan : InvtWPB_i_Plan;
            let Qt_Plan = i!==startIndex ? playerProductions[i].Qt_Plan : req.body.Qt_Plan;
            // console.log("Qt_Plan .. ", Qt_Plan);
            // console.log("playerProductions["+i+"].InvtWPB_i_Plan .. ",InvtWPB_i_Plan_Month)
            // console.log("playerProductions["+i+"].InvtWPE_i_Plan .. ",InvtWPB_i_Plan_Month+Qt_Plan)
            playerProductions[i].InvtWPB_i_Plan = InvtWPB_i_Plan_Month;
            playerProductions[i].InvtWPE_i_Plan = playerProductions[i].InvtWPB_i_Plan+Qt_Plan;
            //console.log("update player production ... ", playerProductions[i]);
            await playerProductions[i].save()
        }
        playerProduction = playerProductions[startIndex];
      }else{
        // if no productions found
        playerProduction = await Model.playerProductions.findOneAndUpdate({month: month._id,team: req.params.team},{$set: {Qt_Plan: req.body.Qt_Plan, InvtWPB_i_Plan: InvtWPB_i_Plan, InvtWPE_i_Plan: InvtWPB_i_Plan+req.body.Qt_Plan}},{upsert: true,new: true})
      }

      res.send({success: true, production: playerProduction})

 	 })
*/
  // get productions by months sorted by index

  fastify.get('/:team/:game_id',{
      schema: {
        description: 'Get production player values sorted by periods indexes (months)',
        tags: ['production'],
        summary: 'get production player values',
        params: {
          type: 'object',
          properties: {
            game_id: { type: 'string' , description: "Game ID"},
            team: { type: 'string' , description: "Team Name"}
	      	}
        },
        response: {
          200: {
            description: 'Successful response, list of months with production values, Qt and Qt_Plan',
            type: 'object',
            properties: {
              months: { 
              	type: 'array', 
              	items:  {
              		type: 'object',
              		properties: {
              			month: {type: 'string'},
              			currentMonth: {type: 'boolean'},
              			Qt: {type: 'number'}, 
              			Qt_Plan: {type: 'number'}, 
                    InvtWPB_i: {type: 'number'}, 
                    InvtWPE_i: {type: 'number'}, 
		              	InvtWPB_i_Plan: {type: 'number'}, 
		              	InvtWPE_i_Plan: {type: 'number'}
              		}
              	}
              },
              success: { type: 'boolean' }
            }
          }
        }
      
      }
    },
    async function (req, res) {

      let months = await Model.periods.find({game: req.params.game_id}).sort('index')
      let playerProductions = await Model.playerProductions.find({team: req.params.team}).sort('created').lean()
      let monthsResp = []
      for(let month of months){
        let playerProdMonth = playerProductions.find(pp =>  pp.month == month.id) || {}
        monthsResp.push(
            Object.assign(playerProdMonth,{
              month: month.label,
            })
          )
      }
      res.send({months: monthsResp});

 	 })  


  // fastify.get('/production/:game_id',{
  //     schema: {
  //       description: 'Get production values for all teams in the game sorted by periods indexes (months), with cost values',
  //       tags: ['production'],
  //       summary: 'get production values for all teams by months, with cost and emission',
  //       params: {
  //         type: 'object',
  //         properties: {
  //           game_id: { type: 'string' , description: "Game ID"},
	 //      	}
  //       },
  //       response: {
  //         200: {
  //           description: 'Successful response, list of months with production values, with total cost and emission',
  //           type: 'object',
  //           properties: {
  //            	teams: {
  //           		type: 'array',
  //           		items: {
  //           			type: 'object',
  //                 properties: {
  //                   team: {type: 'string'},
  //           				months: {
  //           					type: 'array',
  //           					items: {
  //           						type: 'object',
  //           						properties: {
  //           							month: {type: 'string'},
		// 	              			Qt: {type: 'number'}, 
		// 	              			Qt_Plan: {type: 'number'}, 
  //                         InvtWPB_i: {type: 'number'}, 
  //                         InvtWPE_i: {type: 'number'},
		// 			              	InvtWPB_i_Plan: {type: 'number'}, 
		// 			              	InvtWPE_i_Plan: {type: 'number'}
  //           						}
  //           					}
  //           				}
  //           			}
  //           		}
	 //            },
        			
  //       			totalCost: {type: 'number'},
  //       			totalEmission: {type: 'number'},
  //             success: { type: 'boolean' }
  //           }
  //         }
  //       }
      
  //     }
  //   },
  //   async function (req, res) {
  //     let months = await Model.periods.find({game: req.params.game_id});
  //     let playerProductions = await Model.playerProductions.find().sort('created').lean();
  //     let teams = await Model.teams.find();
  //     let teamsResp = [];
  //     for(let team of teams){
  //       let monthsResp = []
  //       for(let month of months){
  //         let playerProdMonth = playerProductions.find(pp =>  pp.team == team.name && pp.month == month.id);
  //         monthsResp.push(
  //             Object.assign({ 
  //               month: month.label,
  //             },playerProdMonth)
  //           )
  //       }
  //       teamsResp.push({
  //         team: team.name,
  //         months: monthsResp
  //       })
  //     }
  //     res.send({teams: teamsResp});
 	//  })


  next()
}




// If you prefer async/await, use the following
//
// module.exports = async function (fastify, opts) {
//   fastify.get('/example', async function (request, reply) {
//     return 'this is an example'
//   })
// }
