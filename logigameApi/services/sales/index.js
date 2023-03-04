'use strict'

// sale model

const Model = require('../../models/init')
const Util = require('../../lib/utils')

const saleProperties = {
	  InvtWRB_0: { type: 'number' , description: "Inventory level to start with for feasibility"},
    WR_Cap: { type: 'number', description: "Production Warehouse Maximum Storage Capacit" },
    UHoldWR_Cost: { type: 'number', description: "Per unit/per month holding cost at retailer’s warehouse" },
    UHoldWR_Em: { type: 'number', description: "Per unit/per month emission unit at retailer’s warehouse" },
    D_Demand_i: { type: 'number', description: "12 month demand given by the moderator" },
    Sales_i: { type: 'number', description: "12 month sales given by the moderator" },
    PED: { type: 'number', description: "Price Demand Elasticity Factor" }
}

// DEPRECATED!
// async function updateSalesValuesAllTeams(opt){
//   //opt { InvtWRB_0: production.InvtWRB_0,
//   //      PED: PED,
//   //      game: req.params.game_id, 
//   //      month: month, 
//   //      allPlayerProductions: allPlayerProductions, 
//   //      avgPrice: avgPrice
//   //      allTeams: allTeams}


//   for(let team of opt.allTeams){

//     let playerProductions = await Model.playerProductions.find({team: team.name}).sort('created').lean();
//     let playerProduction = playerProductions.find(pp =>  pp.month == opt.month.id);

//     let InvtWRB_i = playerProduction.InvtWRB_i!== undefined ? playerProduction.InvtWRB_i : opt.InvtWRB_0;
//     // if(playerProductions && playerProductions.length > 1){
//     //       InvtWRB_i = playerProductions[playerProductions.length-2].InvtWRE_i
//     // }
//     let advOption = playerProduction.Advertisement||1;
//     let adv = opt.advertisements.find(ad => ad.index == advOption)
//     let numTeams = opt.allTeams.length;
//     let realDemand = Util.calculateRealDemand_SM({month: opt.month, price: playerProduction.Price, PED: opt.PED, Advertisement: (adv ? adv.Yield_Impact : 0),numTeams: numTeams, avgPrice: opt.avgPrice})
//     let sales = Util.calculateSaleMonth({realDemand: realDemand, InvtWRB_i: InvtWRB_i})
//     let lostSales = Math.max(0,realDemand-InvtWRB_i)
//     let InvtWRE_i = InvtWRB_i-sales;

//     let playerProductionUpdate = await Model.playerProductions.findOneAndUpdate({month: opt.month._id,team: team.name},
//           {$set: {
            
//             RealDemand: realDemand,
//             Sales: sales,
//             LostSales: lostSales,
//             Advertisement: advOption,
//             InvtWRE_i: InvtWRE_i

//           }},{upsert: true, new: true})
//     console.log("PLAYER PRODUCTIONs ....... ",playerProductionUpdate);
//   }
// }


module.exports = function (fastify, opts, next) {
  // fastify.post('/sales/:game_id/inputs',{
  //     schema: {
  //       description: 'Set sales inputs',
  //       tags: ['sales'],
  //       summary: 'Setup sales inputs',
  //       params: {
  //         type: 'object',
  //         properties: {
  //           game_id: { type: 'string' , description: "Game ID"},
  //         }
          
  //       },
  //       body: {
  //         type: 'object',
  //         properties: saleProperties
          
  //       },
  //       response: {
  //         200: {
  //           description: 'Successful response',
  //           type: 'object',
  //           properties: {
  //             sale: { type: 'object', properties: {id: {type: 'string'}} },
  //             success: { type: 'boolean' }
  //           }
  //         }
  //       }
      
  //     }
  //   },
  //   async function (request, reply) {
  //     let sale = await Model.sales.findOneAndUpdate({game: request.params.game_id},{$set: request.body},{upsert: true, new: true})
	 //  	reply.send({success: true, sale: sale})
 	//  })


  // fastify.get('/sales/:game_id/inputs',{
  //     schema: {
  //       description: 'Get sale inputs with game-id in params',
  //       tags: ['sales'],
  //       summary: 'Get sales inputs',
  //       params: {
  //         type: 'object',
  //         properties: {
  //           game_id: { type: 'string' , description: "Game ID"},
  //         }
  //       },
  //       response: {
  //         200: {
  //           description: 'Successful response, return sales object',
  //           type: 'object',
  //           properties: {
  //             sale: { type: 'object', properties: Object.assign(saleProperties,{game: { type: 'string', description: "Game ID" }, _id: { type: 'string', description: "sale ID" }}) },
  //             success: { type: 'boolean' }
  //           }
  //         }
  //       }
      
  //     }
  //   },
  //   async function (request, reply) {
  //     let sale = await Model.sales.findOne({game: request.params.game_id})
  //     reply.send({success: true, sale: sale})
  //  })


  fastify.get('/:game_id/priceElasticity',{
      schema: {
        description: 'Get price elasticities with game-id in params',
        tags: ['sales'],
        summary: 'Get price elasticities',
        params: {
          type: 'object',
          properties: {
            game_id: { type: 'string' , description: "Game ID"},
	        }
        },
        response: {
          200: {
            description: 'Successful response, return price elasticities',
            type: 'object',
            properties: {
              priceElasticities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {type: 'object'},
                    current: {type: 'boolean'}
                  }
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

   
  fastify.post('/:team/:game_id/:month/expectedDemand',{
      schema: {
        description: 'Post player expectedDemand for the month index (month == currentMonth)',
        tags: ['sales'],
        summary: 'Send player expected demand value for the month',
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
            expectedDemand: {type: 'number'}
          }
        },
        response: {
          200: {
            description: 'Successful response, return Warehouse info, real demand, sales and lost sales if possible',
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: {type: 'string'}
            }
          }
        }
      }
    },
    async function (request, reply) {
      // TODO implement
      let playerProduction = await Model.playerProductions.findOne({team: req.params.team,month: month._id})//.populate({path:'month', match: {index: {$lt: req.params.month} }})
        if(!playerProduction){
          res.send({success: false,message: 'Payer instance does not exist'})
          return;
        }
        playerProduction.ExpectedDemand = parseFloat(req.body.expectedDemand)
        await playerProduction.save();
        res.send({success: true}) 
   })
   
  fastify.post('/:team/:game_id/:month/price',{
      schema: {
        description: 'Post player price for the month index (month == currentMonth)',
        tags: ['sales'],
        summary: 'Send player price value for the month',
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
            price: {type: 'number'}
          }
        },
        response: {
          200: {
            description: 'Successful response, return Warehouse info, real demand, sales and lost sales if possible',
            type: 'object',
            properties: {
              sales: { type: 'object', 
                properties: {
                  InvWRB_i: {type: 'number', description: 'Retail warehouse inventory at the beginning of month'},  
                  InvWPE_i: {type: 'number', description: 'Retail warehouse inventory at the end of month'}, 
                  RealDemand: {type: 'number'},
                  Sales: {type: 'number'},
                  LostSales: {type: 'number'}
                }
              },
              success: { type: 'boolean' },
              message: {type: 'string'}
            }
          }
        }
      }
    },
    async function (req, res) {
      // TODO implement
      // deterministic demand
      let months = await Model.periods.find({game: req.params.game_id}).sort('index') 
      let month = months.find(m => m.index == req.params.month) 
      let sale = await Model.sales.findOne({game: req.params.game_id})        

      // let production = await Model.productions.findOne({game: req.params.game_id})
      // let saleModel = await Model.sales.findOne({game: req.params.game_id})
      // check month is current month

        let playerProduction = await Model.playerProductions.findOne({team: req.params.team,month: month._id})//.populate({path:'month', match: {index: {$lt: req.params.month} }})
        if(!playerProduction){
          res.send({success: false,message: 'Payer instance does not exist'})
        }
        let allPlayerProductions = await Model.playerProductions.find({month: month._id}).sort('created').lean()
          
        // let InvtWRB_i = playerProduction.InvtWRB_i!== undefined ? playerProduction.InvtWRB_i : production.InvtWRB_0;;

        // console.log("game _id ", req.params.game_id);
        // let allTeams = await Model.teams.find({game: req.params.game_id});
        // let restTeams = allTeams.filter(team => team.name != req.params.team);
        // let numTeams = allTeams.length;


        allPlayerProductions.find(pp => pp.team == req.params.team).Price = parseFloat(req.body.price);
        // verify findindex on collection
        // console.log("price not found index accross teams ..... ",priceNotFoundIndex);
        // console.log(playerProductions[priceNotFoundIndex]);
        console.log("Price ...")
        console.log("Price ...")
        console.log("Price ...")
        console.log("Price ...")
        console.log("Price ...")
        console.log("Price ...")
        console.log("Price ...")
        console.log("Price ...")
        console.log("Price ...")
        console.log("Price ...",parseFloat(req.body.price))
        console.log("Price ...",req.body)
        playerProduction.Price = parseFloat(req.body.price);
        await playerProduction.save();

        if(sale.MarketType=="shared"){
          let priceNotFoundIndex = allPlayerProductions.findIndex(pp =>  !pp.Price );
          if(priceNotFoundIndex !== -1){
            // save data here
            res.send({success: true, message: "We will calculate the values, as soon as the rest of players insert their prices", sales: playerProduction})
            return;
          } 
        }  
        // console.log("avg price tab .... ",playerProductions.map(pp => pp.Price))
        // console.log("all playerProductions tab .... ",allPlayerProductions)
        // console.log("game teams ....  .... ",numTeams)

        // let avgPrice = allPlayerProductions.map(pp => pp.Price).reduce((prev,next) => {return prev+next})/numTeams;        
        // let realDemand = Util.calculateRealDemand_SM({month: month, price: req.body.price, PED: saleModel.PED, Advertisement: 0,numTeams: numTeams, avgPrice: avgPrice})
        // let sales = Util.calculateSaleMonth({realDemand: realDemand, InvtWRB_i: InvtWRB_i})
        // let lostSales = Math.max(0,realDemand-InvtWRB_i)

        // let InvtWRE_i = InvtWRB_i-sales;
        // console.log("avgPrice ... ", avgPrice);
        // console.log("realDemand ... ", realDemand);
        // console.log("sales ... ", sales);
        // console.log("lost sales ... ", lostSales);
        // console.log("inventory end of month ... ", InvtWRE_i);

        // let salesVars = {
        //     RealDemand: realDemand,
        //     Sales: sales,
        //     LostSales: lostSales,
        //     Advertisement: 0,
        //     InvtWRE_i: InvtWRE_i,
        //     Price: req.body.price
        // }
        // Object.assign(playerProduction,salesVars)

        // playerProduction.save();
        // playerProduction = await Model.playerProductions.findOneAndUpdate({month: month._id,team: req.params.team},
        //   {$set: {
            
        //     RealDemand: realDemand,
        //     Sales: sales,
        //     LostSales: lostSales,
        //     Advertisement: 0,
        //     InvtWRE_i: InvtWRE_i,
        //     Price: req.body.price

        //   }},{upsert: true, new: true})
        // update  other teams values
        

        // updateSalesValuesAllTeams({avgPrice: avgPrice, InvtWRB_0: production.InvtWRB_0,PED: saleModel.PED,game: req.params.game_id, month: month, allPlayerProductions: allPlayerProductions, allTeams: restTeams})
        if(sale.MarketType == 'shared'){

          let allTeams = await Model.teams.find({game: req.params.game_id});
          let opts=  { game_id: req.params.game_id, months: months, allTeams: allTeams }
          await Util.updateSalesSharedMarket(opts)

        }else{
          let opts=  { game_id: req.params.game_id, months: months, team: req.params.team, sale: sale }
          console.log("updateSalesIndependentMarket .............. ")
          console.log("updateSalesIndependentMarket .............. ")
          console.log("updateSalesIndependentMarket .............. ")
          await Util.updateSalesIndependentMarket(opts)  
        }


        res.send({success: true, sales: playerProduction, message: 'request sales values ...'})
      
   })


  fastify.post('/:team/:game_id/:month/advertisement',{
      schema: {
        description: 'Post player advertisement (option select) for the month index (month == currentMonth)',
        tags: ['sales'],
        summary: 'Send player advertisement value for the month',
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
            Adv_i: {type: 'number'}
          }
        },
        response: {
          200: {
            description: 'Successful response, return Warehouse info, real demand, sales and lost sales if possible',
            type: 'object',
            properties: {
              sales: { type: 'object', 
                properties: {
                  InvWRB_i: {type: 'number', description: 'Retail warehouse inventory at the beginning of month'},  
                  InvWPE_i: {type: 'number', description: 'Retail warehouse inventory at the end of month'}, 
                  RealDemand: {type: 'number'},
                  Sales: {type: 'number'},
                  LostSales: {type: 'number'}
                }
              },
              success: { type: 'boolean' },
              message: {type: 'string'}
            }
          }
        }
      }
    },
    async function (req, res) {
      // TODO implement
        let months = await Model.periods.find({game: req.params.game_id}).sort('index') 
        let month = months.find(m => m.index == req.params.month) 
        let sale = await Model.sales.findOne({game: req.params.game_id})        
      
        let playerProduction = await Model.playerProductions.findOne({team: req.params.team,month: month._id})//.populate({path:'month', match: {index: {$lt: req.params.month} }})
        if(!playerProduction){
          res.send({success: false,message: 'Payer instance does not exist'})
          return;
        }
        
        playerProduction.Advertisement = parseInt(req.body.Adv_i);
        await playerProduction.save();


        if(sale.MarketType == 'shared'){

          let allTeams = await Model.teams.find({game: req.params.game_id});
          let opts=  { game_id: req.params.game_id, months: months, sale: sale, allTeams: allTeams }

          Util.updateSalesSharedMarket(opts)

        }else{

          let opts=  { game_id: req.params.game_id, months: months, team: req.params.team, sale: sale }

          Util.updateSalesIndependentMarket(opts)  

        }

        res.send({success: true, sales: playerProduction, message: 'request sales values ...'})
 
   })


  // fastify.post('/sales/:game_id/advertisement',{
  //     schema: {
  //       description: 'Insert advertisement for the game',
  //       tags: ['sales'],
  //       summary: 'Send advertisement values for the game',
  //       params: {
  //         type: 'object',
  //         properties: {
  //           game_id: { type: 'string' , description: "Game ID"}
  //         }
  //       },
  //       body: {
  //         type: 'object',
  //         properties: {
  //           index: {type: 'number'},
  //           yieldImpact: {type: 'number'},
  //           budget: {type: 'number'},
  //           comment: {type: 'string'}
  //         }
  //       },
  //       response: {
  //         200: {
  //           description: 'Successful response, return created advertisement',
  //           type: 'object',
  //           properties: {
  //             advertisement: { type: 'object', 
  //               properties: {
  //                 _id: {type: 'string'},
  //                 index: {type: 'number'},
  //                 yieldImpact: {type: 'number'},
  //                 budget: {type: 'number'},
  //                 comment: {type: 'string'}
  //               }
  //             },
  //             success: { type: 'boolean' },
  //             message: {type: 'string'}
  //           }
  //         }
  //       }
  //     }
  //   },
  //   async function (request, reply) {
  //    //TODO implement


  //  })


  // fastify.get('/sales/:game_id/advertisements',{
  //     schema: {
  //       description: 'Get advertisement list',
  //       tags: ['sales'],
  //       summary: 'Get advertisement list for the game',
  //       params: {
  //         type: 'object',
  //         properties: {
  //           game_id: { type: 'string' , description: "Game ID"}
  //         }
  //       },
  //       response: {
  //         200: {
  //           description: 'Successful response, return list advertisements',
  //           type: 'object',
  //           properties: {
  //             advertisements: { type: 'array',
  //               items: {
  //                 type: 'object',
  //                 properties: {
  //                   _id: {type: 'string'},
  //                   index: {type: 'number'},
  //                   yieldImpact: {type: 'number'},
  //                   budget: {type: 'number'},
  //                   comment: {type: 'string'}
  //                 }
  //               } 
  //             },
  //             success: { type: 'boolean' },
  //             message: {type: 'string'}
  //           }
  //         }
  //       }
  //     }
  //   },
  //   async function (request, reply) {
  //     // TODO implement
  //  })
   
  // fastify.post('/sales/:game_id/deterministicDemand',{
  //     schema: {
  //       description: 'Post deterministic demands for all months and all teams (update values if exist)',
  //       tags: ['sales'],
  //       summary: 'Send deterministic demand values for all months',
  //       params: {
  //         type: 'object',
  //         properties: {
  //           game_id: { type: 'string' , description: "Game ID"}
  //         }
  //       },
  //       body: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             deterministicDemand: {type: 'number'},
  //             month: {type: 'number',description: 'Month index' }
  //           }
  //         }
  //       },
  //       response: {
  //         200: {
  //           description: 'Successful response',
  //           type: 'object',
  //           properties: {
              
  //             success: { type: 'boolean' },
  //             message: { type: 'string' }
  //           }
  //         }
  //       }
  //     }
  //   },
  //   async function (request, reply) {
  //     // TODO implement
  //  })





  fastify.get('/:team/:game_id',{
      schema: {
        description: 'Get sales player values sorted by periods indexes (months)',
        tags: ['sales'],
        summary: 'get sales player values',
        params: {
          type: 'object',
          properties: {
            game_id: { type: 'string' , description: "Game ID"},
            team: { type: 'string' , description: "Team Name"}
          }
        },
        response: {
          200: {
            description: 'Successful response, list of months with sales values',
            type: 'object',
            properties: {
              months: { 
                type: 'array', 
                items:  {
                  type: 'object',
                  properties: {
                    month: {type: 'string'},
                    InvtWRB_i: {type: 'number'}, 
                    InvtWRE_i: {type: 'number'}, 
                    deterministicDemand: {type: 'number'}, 
                    expectedDemand: {type: 'number'}, 
                    Price: {type: 'number'}, 
                    Advertisement: {type: 'string', description: 'comment of advertisement object'},
                    RealDemand: {type: 'number'},
                    Sales: {type: 'number'},
                    LostSales: {type: 'number'}
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
      let months = await Model.periods.find({game: req.params.game_id}).sort('index');
      let playerProductions = await Model.playerProductions.find().sort('created').lean();
      let team = await Model.teams.findOne({name: req.params.team});
      
      let monthsResp = []
      for(let month of months){
        let playerProdMonth = playerProductions.find(pp =>  pp.team == team.name && pp.month == month.id) || {};
        monthsResp.push(
            Object.assign(playerProdMonth,{ 
              month: month.label,
              demand: month.demandHistory!==undefined ? month.demandHistory : month.demand,
            })
          )
      }
        
      res.send({months: monthsResp});
   })  


  fastify.get('/:game_id',{
      schema: {
        description: 'Get sales values for all teams in the game sorted by periods indexes (months), with cost values',
        tags: ['sales'],
        summary: 'get sales values for all teams by months, with cost and emission',
        params: {
          type: 'object',
          properties: {
            game_id: { type: 'string' , description: "Game ID"},
          }
        },
        response: {
          200: {
            description: 'Successful response, list of months with sales values',
            type: 'object',
            properties: {
              teams: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    team: {type: 'string'},
                    months: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          month: {type: 'string'},
                          InvWRB_i: {type: 'number'}, 
                          InvWRE_i: {type: 'number'}, 
                          deterministicDemand: {type: 'number'}, 
                          historicDemand: {type: 'number'}, 
                          expectedDemand: {type: 'number'}, 
                          Price: {type: 'number'}, 
                          Advertisement: {type: 'number', description: 'comment of advertisement object'},
                          RealDemand: {type: 'number'},
                          Sales: {type: 'number'},
                          LostSales: {type: 'number'}
                        }
                      }
                    }
                  }
                }
              },
              
              NotSureOfThisValueTotal: {type: 'number'},
              success: { type: 'boolean' }
            }
          }
        }
      
      }
    },
    async function (req, res) {

      let months = await Model.periods.find({game: req.params.game_id}).sort('index');
      let playerProductions = await Model.playerProductions.find().sort('created').lean();
      let teams = await Model.teams.find({game: req.params.game_id});
      let teamsResp = [];
      for(let team of teams){
        let monthsResp = []
        for(let month of months){
          let playerProdMonth = playerProductions.find(pp =>  pp.team == team.name && pp.month == month.id) || {};

          monthsResp.push(
              Object.assign(playerProdMonth,{ 
                month: month.label,
                demand: month.demandHistory!==undefined ? month.demandHistory : month.demand,
              })
            )
        }
        teamsResp.push({
          team: team.name,
          months: monthsResp
        })
      }
      res.send({teams: teamsResp});
   })






  next()
}


