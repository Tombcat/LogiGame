'use strict'

// distribution model

const Model = require('../../models/init')
const Util = require('../../lib/utils')

const distributionProperties = {
	UAir_Cost: { type: 'number' , description: "Per unit cost of moving one item by air"},
    Cont_Cost: { type: 'number', description: "Cost of moving one container by sea" },
    Cont_Cap: { type: 'number', description: "Capacity of container" },
    UAir_Em: { type: 'number', description: "Per unit emission of moving one item by air" },
    Cont_Em: { type: 'number', description: "Emission of moving one container" },
   
}

module.exports = function (fastify, opts, next) {
  // fastify.post('/distribution/:game_id/inputs',{
  //     schema: {
  //       description: 'Set distribution inputs',
  //       tags: ['distribution'],
  //       summary: 'Setup distribution inputs',
  //       body: {
  //         type: 'object',
  //         properties: distributionProperties
          
  //       },
  //       response: {
  //         200: {
  //           description: 'Successful response',
  //           type: 'object',
  //           properties: {
  //             distribution: { type: 'object', properties: {id: {type: 'string'}} },
  //             success: { type: 'boolean' }
  //           }
  //         }
  //       }
      
  //     }
  //   },
  //   async function (req, res) {
	 //  	let distribution = await Model.distributions.findOneAndUpdate({game: req.params.game_id},{$set: req.body},{upsert: true, new: true})
	 //  	res.send({success: true, distribution: distribution})
 	//  })


  // fastify.get('/distribution/:game_id/inputs',{
  //     schema: {
  //       description: 'Get distribution inputs with game-id in params',
  //       tags: ['distribution'],
  //       summary: 'Get distribution inputs',
  //       params: {
  //         type: 'object',
  //         properties: {
  //           game_id: { type: 'string' , description: "Game ID"},
	 //      }
          
  //       },
  //       response: {
  //         200: {
  //           description: 'Successful response',
  //           type: 'object',
  //           properties: {
  //             distribution: { type: 'object', properties: Object.assign(distributionProperties,{_id: { type: 'string', description: "distribution ID" },game: { type: 'string', description: "Game ID" }}) },
  //             success: { type: 'boolean' }
  //           }
  //         }
  //       }
      
  //     }
  //   },
  //   async function (request, reply) {
	 //  	let distribution = await Model.distributions.findOne({game: request.params.game_id})
	 //  	reply.send({success: true, distribution: distribution})
 	//  })



  fastify.post('/:team/:game_id/:month/airTransportation',{
      schema: {
        description: 'Post player distribution QTA_i (Transportation by Air) for the month index (month == currentMonth)',
        tags: ['distribution'],
        summary: 'Send player QTA_i value for the month',
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
            QTA_i: {type: 'number'}
          }
        },
        response: {
          200: {
            description: 'Successful response, return inventory available distribution warehouse and inventory status retailing warehouse',
            type: 'object',
            properties: {
              distribution: { type: 'object', 
                properties: {
                  QTA_i: {type: 'number'},  
                  InvtWPB_i: {type: 'number'}, 
                  InvtWRB_i: {type: 'number'}
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
      // calculate inventory at production and reatail warehouse
      // at production warehouse
      // use playerProduction for inventory data update
      let months = await Model.periods.find({game: req.params.game_id}).sort('index') 
      let month = months.find(m => m.index == req.params.month) 
      let prevMonth = months.find(m => m.index == req.params.month-1) 
      let production = await Model.productions.findOne({game: req.params.game_id})
      let sale = await Model.sales.findOne({game: req.params.game_id})

      // check month is current month
      let playerProduction = await Model.playerProductions.findOneAndUpdate({team: req.params.team,month: month._id},{},{upsert: true, new: true})
      let prevPlayerProduction = prevMonth ? await Model.playerProductions.findOne({team: req.params.team, month: prevMonth._id}) : null;
      
      let InvtWPE_i = playerProduction.InvtWPE_i ;
      let InvtWRB_i = playerProduction.InvtWRB_i || (prevPlayerProduction ? prevPlayerProduction.InvtWRB_i : production.InvtWRB_0);
      
      let pQTA = playerProduction.QTA_i || 0;
      let pQTS = playerProduction.QTS_i || 0;
      // add condition with the retail capacity


      console.log("Request to recalculate capacity ",req.body.QTA_i)
      console.log("pQTA ..... ",pQTA)
      console.log("pQTS ..... ",pQTS)
      console.log("InvtWPE_i ..... ",InvtWPE_i)
      console.log("InvtWRB_i ..... ",InvtWRB_i)
      console.log("sale.WR_Cap ..... ",sale.WR_Cap)
      console.log("Total transport request .......", InvtWRB_i+parseInt(req.body.QTA_i)+pQTS)
      

      if(sale.WR_Cap<(InvtWRB_i+parseInt(req.body.QTA_i)+pQTS)){
        res.send({success: false, message: "Can't ship by Air, Warehouse capacity is limited to : "+sale.WR_Cap});
        return;
      }
      if((InvtWPE_i-parseInt(req.body.QTA_i)+pQTA) < 0){
        res.send({success: false, message: "Can't transport a quantitie more than the initial inventory: "+(InvtWPE_i+pQTA)});
        return;        
      }
      
      playerProduction = await Model.playerProductions.findOneAndUpdate({month: month._id,team: req.params.team},{$set: {QTA_i: parseInt(req.body.QTA_i), InvtWPE_i: (InvtWPE_i-parseInt(req.body.QTA_i)+pQTA), InvtWRE_i: (InvtWRB_i+parseInt(req.body.QTA_i)-pQTA)}},{upsert: true, new: true})
      // recalculate inventory for sales ... and for next months without considering update
      await Util.recalculateInventory({game_id: req.params.game_id,months: months,team: req.params.team})
      res.send({success: true, distribution: playerProduction})
    })

/*  fastify.post('/distribution/plan/:team/:game_id/:month/airTransportation',{
      schema: {
        description: 'Post player distribution QTA_i_Plan (Transportation by Air Plan) for the month index (month > currentMonth)',
        tags: ['distribution'],
        summary: 'Send player QTA_i_Plan value for the month',
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
            QTA_i_Plan: {type: 'number'}
          }
        },
        response: {
          200: {
            description: 'Successful response, return inventory available distribution warehouse and inventory status retailing warehouse',
            type: 'object',
            properties: {
              distribution: { type: 'object', 
                properties: {
                  QTA_i_Plan: {type: 'number'},  
                  InvtWPB_i_Plan: {type: 'number'}, 
                  InvtWRB_i_Plan: {type: 'number'}
                }
              },
              success: { type: 'boolean' }
            }
          }
        }
      }
    },
    async function (request, reply) {
      // TODO implement
   })*/

  fastify.post('/:team/:game_id/:month/seaTransportation',{
      schema: {
        description: 'Post player distribution QTS_i (Transportation by Sea) for the month index (month == currentMonth)',
        tags: ['distribution'],
        summary: 'Send player QTS_i value for the month',
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
            QTS_i: {type: 'number'}
          }
        },
        response: {
          200: {
            description: 'Successful response, return inventory available distribution warehouse and inventory status retailing warehouse',
            type: 'object',
            properties: {
              distribution: { type: 'object', 
                properties: {
                  QTS_i: {type: 'number'}, 
                  InvtWPB_i: {type: 'number'}, 
                  InvtWRB_i: {type: 'number'}
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
      
      let months = await Model.periods.find({game: req.params.game_id}).sort('index') 
      let month = months.find(m => m.index == req.params.month) 
      let prevMonth = months.find(m => m.index == req.params.month-1) 
      let nextMonth = months.find(m => m.index == req.params.month+1) 
      let production = await Model.productions.findOne({game: req.params.game_id})
      // check month is current month
      console.log("game infos ",req.params.team)
      console.log("game infos ",month._id)
      let playerProduction = await Model.playerProductions.findOneAndUpdate({team: req.params.team,month: month._id},{},{upsert: true, new: true})
      let prevPlayerProduction = prevMonth ? await Model.playerProductions.findOne({team: req.params.team, month: prevMonth._id}) : null;
      let sale = await Model.sales.findOne({game: req.params.game_id})
      
      let InvtWPE_i = playerProduction.InvtWPE_i; //Inventory Warehouse Production End
      let InvtWRB_i = playerProduction.InvtWRB_i || (prevPlayerProduction ? prevPlayerProduction.InvtWRE_i : production.InvtWRB_0); //Inventory Warehouse Retail Begining
      
      let pQTS = playerProduction.QTS_i || 0;
      let pQTA = playerProduction.QTA_i || 0;
      
      if(InvtWPE_i-parseInt(req.body.QTS_i)+pQTS < 0){
        res.send({success: false, message: "Can't transport a quantitie more than the initial inventory: "+(InvtWPE_i+pQTS)});
        return;
      }
      
      // update next month player production for sea transportation
      // if(nextMonth)
      let message ='';
      if(!nextMonth){
        message= 'No update for inventory retail warehouse, there is no next month, consider air transportation';
      }else{
        // check if inventory warehouse next month will support this quantity
        let ppNextMonth = await Model.playerProductions.findOne({team: req.params.team,month: nextMonth._id})

        console.log("Request to recalculate capacity ",req.body.QTS_i)
        console.log("pQTA ..... ",pQTA)
        console.log("pQTS ..... ",pQTS)
        console.log("InvtWPE_i ..... ",InvtWPE_i)
        console.log("InvtWRB_i ..... ",InvtWRB_i)
        console.log("ppNextMonth.InvtWPE_i ..... ",ppNextMonth.InvtWPE_i)
        console.log("ppNextMonth.InvtWRB_i ..... ",ppNextMonth.InvtWRB_i)
        console.log("sale.WR_Cap ..... ",sale.WR_Cap)
        console.log("Total transport request .......", InvtWRB_i+parseInt(req.body.QTS_i)+pQTA)
        if(sale.WR_Cap<(ppNextMonth.InvtWRE_i+parseInt(req.body.QTS_i)+pQTA)){
          res.send({success: false, message: "Can't ship, Warehouse capacity is limited to : "+sale.WR_Cap});
          return;
        }
      }
      
      playerProduction = await Model.playerProductions.findOneAndUpdate({month: month._id,team: req.params.team},{$set: {QTS_i: parseInt(req.body.QTS_i), InvtWPE_i: (InvtWPE_i-parseInt(req.body.QTS_i)+pQTS)}},{upsert: true, new: true})
      // recalculate inventories ... update next months InvtWPE_i for sales
      await Util.recalculateInventory({game_id: req.params.game_id,months: months,team: req.params.team})
      res.send({success: true, distribution: playerProduction, message: message})
      
   })
/*
  fastify.post('/distribution/plan/:team/:game_id/:month/seaTransportation',{
      schema: {
        description: 'Post player distribution QTS_i_Plan (Transportation by Sea Plan) for the month index (month > currentMonth)',
        tags: ['distribution'],
        summary: 'Send player QTS_i_Plan value for the month',
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
            QTA_i_Plan: {type: 'number'}
          }
        },
        response: {
          200: {
            description: 'Successful response, return inventory available distribution warehouse and inventory status retailing warehouse',
            type: 'object',
            properties: {
              distribution: { type: 'object', 
                properties: {
                  QTS_i_Plan: {type: 'number'}, 
                  InvtWPB_i: {type: 'number'}, 
                  InvtWRB_i: {type: 'number'}
                }
              },
              success: { type: 'boolean' }
            }
          }
        }
      }
    },
    async function (request, reply) {
      // TODO implement
   })
*/

  fastify.get('/:team/:game_id',{
      schema: {
        description: 'Get distribution player values sorted by periods indexes (months)',
        tags: ['distribution'],
        summary: 'get distribution player values',
        params: {
          type: 'object',
          properties: {
            game_id: { type: 'string' , description: "Game ID"},
            team: { type: 'string' , description: "Team Name"}
          }
        },
        response: {
          200: {
            description: 'Successful response, list of months with distribution values, Qt and Qt_Plan',
            type: 'object',
            properties: {
              months: { 
                type: 'array', 
                items:  {
                  type: 'object',
                  properties: {
                    month: {type: 'string'},
                    currentMonth: {type: 'boolean'},
                    QTA_i: {type: 'number'}, 
                    QTS_i: {type: 'number'}, 
                    QTA_i_Plan: {type: 'number'}, 
                    QTS_i_Plan: {type: 'number'}, 
                    InvtWPB_i: {type: 'number'}, 
                    InvtWRB_i: {type: 'number'},
                    InvtWPB_i_Plan: {type: 'number'}, 
                    InvtWRB_i_Plan: {type: 'number'}
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
      // TODO implement
      let months = await Model.periods.find({game: req.params.game_id}).sort('index')
      let playerProductions = await Model.playerProductions.find({team: req.params.team}).sort('created').lean()
      let monthsResp = []
      for(let month of months){
        let playerProdMonth = playerProductions.find(pp =>  pp.month == month.id) || {};
        monthsResp.push(
            Object.assign(playerProdMonth,{
              month: month.label
              //currentMonth: Util.compareMonth(month.start) === 0,
            })
          )
      }
      res.send({months: monthsResp});
   })  


  // fastify.get('/distribution/:game_id',{
  //     schema: {
  //       description: 'Get distribution values for all teams in the game sorted by periods indexes (months), with cost values',
  //       tags: ['distribution'],
  //       summary: 'get distribution values for all teams by months, with cost and emission',
  //       params: {
  //         type: 'object',
  //         properties: {
  //           game_id: { type: 'string' , description: "Game ID"},
  //         }
  //       },
  //       response: {
  //         200: {
  //           description: 'Successful response, list of months with distribution values, with total cost and emission',
  //           type: 'object',
  //           properties: {
  //             teams: {
  //               type: 'array',
  //               items: {
  //                 type: 'object',
  //                 properties: {
  //                   team: {type: 'string'},
  //                   months: {
  //                     type: 'array',
  //                     items: {
  //                       type: 'object',
  //                       properties: {
  //                         month: {type: 'string'},
  //                         QTA_i: {type: 'number'}, 
  //                         QTS_i: {type: 'number'}, 
  //                         QTA_i_Plan: {type: 'number'}, 
  //                         QTS_i_Plan: {type: 'number'}, 
  //                         InvtWPB_i: {type: 'number'}, 
  //                         InvtWRB_i: {type: 'number'},
  //                         InvtWPB_i_Plan: {type: 'number'}, 
  //                         InvtWRB_i_Plan: {type: 'number'}
  //                       }
  //                     }
  //                   }
  //                 }
  //               }
  //             },
              
  //             NotSureOfThisValueTotal: {type: 'number'},
  //             success: { type: 'boolean' }
  //           }
  //         }
  //       }
      
  //     }
  //   },
  //   async function (req, res) {
  //     let months = await Model.periods.find({game: req.params.game_id});
  //     let playerProductions = await Model.playerProductions.find().sort('created').lean();
  //     let teams = await Model.teams.find({game: req.params.game_id});
  //     let teamsResp = [];
  //     for(let team of teams){
  //       let monthsResp = []
  //       for(let month of months){
  //         let playerProdMonth = playerProductions.find(pp =>  pp.team == team.name && pp.month == month.id) || {};
          
  //         monthsResp.push(
  //             Object.assign(playerProdMonth,{ 
  //               month: month.label,
  //             })
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
