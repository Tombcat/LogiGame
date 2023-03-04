'use strict'

// Production model

const Model = require('../../models/init')
const Util = require('../../lib/utils')
const Timer = require('../../lib/timer')
const emitter = require('../../lib/emitter').emitter

const productionProperties = {
  Prod_Cap: { type: 'number' , description: "Monthly Max Production Capacity"},
    LeadProd: { type: 'number', description: "Production leadtime in months" },
    VarProd: { type: 'number', description: "Variability penalty in (%)" },
    UProd_Cost: { type: 'number', description: "Per unit production cost" },
    UProd_Em: { type: 'number', description: "Per unit production emission" },
    InvtWPB_0: { type: 'number', description: "Inventory level to start with" },
    InvtWRB_0: { type: 'number', description: "Retail Inventory level to start with" },
    WP_Cap: { type: 'number', description: "Production Warehouse Maximum Storage Capacity" },
    UHoldWP_Cost: { type: 'number', description: "Per unit/per month holding cost at production warehouse" },
    UHoldWP_Em: { type: 'number', description: "Per unit/per month emission unit at production warehouse" },
    
}

const distributionProperties = {
  UAir_Cost: { type: 'number' , description: "Per unit cost of moving one item by air"},
    Cont_Cost: { type: 'number', description: "Cost of moving one container by sea" },
    Cont_Cap: { type: 'number', description: "Capacity of container" },
    UAir_Em: { type: 'number', description: "Per unit emission of moving one item by air" },
    Cont_Em: { type: 'number', description: "Emission of moving one container" },
   
}

const saleProperties = {
    //InvtWRB_0: { type: 'number' , description: "Inventory level to start with for feasibility"},
    WR_Cap: { type: 'number', description: "Production Warehouse Maximum Storage Capacit" },
    UHoldWR_Cost: { type: 'number', description: "Per unit/per month holding cost at retailer’s warehouse" },
    UHoldWR_Em: { type: 'number', description: "Per unit/per month emission unit at retailer’s warehouse" },
    DeltaPrice: { type: 'number', description: "DeltaPrice to be used in sales" },
    InitialPrice: { type: 'number', description: "InitialPrice to be used in sales" },
    MarketType: {type: 'string', description: 'independant or shared market'},
    DemandType: {type: 'string', description: 'stochastic or deterministic'},
    PED: { type: 'number', description: "Price Demand Elasticity Factor" },

}

module.exports = function (fastify, opts, next) {
  // fastify.post('/game/create',
  //   {
  //     schema: {
  //       description: 'Create new game with user information (id)',
  //       tags: ['game'],
  //       summary: 'Create new game',
  //       body: {
  //         type: 'object',
  //         properties: {
  //           name: { type: 'string' },
  //           user: {
  //             type: 'object',
  //             properties: {
  //               email: { type: 'string' },
  //               user_id: { type: 'string' },
  //               name: { type: 'string' }
  //             }
  //           }
  //         }
  //       },
  //       response: {
  //         200: {
  //           description: 'Successful response',
  //           type: 'object',
  //           properties: {
  //             game: { type: 'object', properties: {name: {type: 'string'}, id: {type: 'string'}} },
  //             success: { type: 'boolean' }
  //           }
  //         }
  //       }
  //       // security: [
  //       //   {
  //       //     "apiKey": []
  //       //   }
  //       // ]
  //     }
  //   }
  //   , async function (request, reply) {

  //   let game = await Model.games.create(request.body)

  //   reply.send({success: true, game: {name: game.name,id: game.id}})
    
  // })




  // fastify.get('/game/:id',
  //   {
  //     schema: {
  //       description: 'request game info by id',
  //       tags: ['game'],
  //       summary: 'get game info',  
  //       params: {
  //         type: 'object',
  //         properties: {
  //           id: {
  //             type: 'string',
  //             description: 'Game id'
  //           }
  //         }
  //       },      
  //       response: {
  //         200: {
  //           description: 'Successful response',
  //           type: 'object',
  //           properties: {
  //             game: { type: 'object', properties: {name: {type: 'string'}, id: {type: 'string'}} }
  //           }
  //         }
  //       }
  //     }
  //   }
  //   , 
  //   async function (request, reply) {
  //     let game = await Model.games.findOne({_id: request.params.id})
  //     reply.send({sucess: true, game: game})
    
  // })


  // fastify.post('/game/:id/periods',
  //   {
  //     schema: {
  //       description: 'Set month periods for the game',
  //       tags: ['game'],
  //       summary: 'set month periods with start and end dates',
  //       params: {
  //         type: 'object',
  //         properties: {
  //           id: {
  //             type: 'string',
  //             description: 'Game id'
  //           }
  //         }
  //       },        
  //       body: {
  //         type: 'array',
  //         items: {
  //           type: 'object',
  //           properties: {
  //             index: {type: 'number'},
  //             name: {type: 'string'},
  //             label: {type: 'string'},
  //             start: {type: 'string', description: 'format dd/mm/yyyy'},
  //             end: {type: 'string', description: 'format dd/mm/yyyy'}
  //           }
  //         }
  //       },      
  //       response: {
  //         200: {
  //           description: 'Successful response',
  //           type: 'object',
  //           properties: {
  //             sucess: { type: 'boolean' }
  //           }
  //         }
  //       }
  //     }
  //   }
  //   , 
  //   async function (req, res) {
  //     //let game = await Model.games.findOne({_id: request.params.id})
  //     let periods = []
  //     for(let p of req.body){
  //       periods.push(Object.assign(p,{game: req.params.id}))
  //     }
  //     await Model.periods.insertMany(periods)
  //     res.send({sucess: true})
    
  // })

  fastify.post('/:id/teams',
    {
      schema: {
        description: 'Add teams to a game',
        tags: ['game'],
        summary: 'add teams to a game',  
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Game id'
            }
          }
        },      
        body: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
                name: {type: 'string'},
                description: {type: 'string'},
                players: {
                  type: 'object',
                  properties: {
                    production: {type: 'string'},
                    distribution: {type: 'string'},
                    sales: {type: 'string'},
                    manager: {type: 'string'}
                  }
                }   
            }
          }
         
        },      
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              team: { type: 'object', properties: {name: {type: 'string'}, description: {type: 'string'}} },
              sucess: {type: 'boolean'}
            }
          }
        }
      }
    }
    , 
    async function (req, res) {
      //let game = await Model.games.findOne({_id: request.params.id})
      // initialize teams values
      let game_id = req.params.id;
      //let team = await Model.teams.create(Object.assign(req.body, {game: req.params.id}))
      //res.send({sucess: true, team: team})
      let production = await Model.productions.findOne({game: game_id})
      let sale = await Model.sales.findOne({game: game_id})
      let months = await Model.periods.find({game: game_id})
      let teams = await Model.teams.insertMany(req.body.map(team => {return {name: team.name,description: team.description, players: team.players,game:game_id}}))
      let teamIds = req.body.map(team => {return {team: team.name,game:game_id}})
      await Model.teamValues.insertMany(teamIds)
      Util.initInvtW({game_id: game_id, teams: teams, months: months, production: production, sale: sale})
      res.send({sucess: true, teams: teams})
  	
  })

  // set teams names in the game

  // create game with inputs
  fastify.post('/inputs',
    {
      schema: {
        description: 'Create new game with inputs',
        tags: ['game'],
        summary: 'create new game with production , destribution and sales inputs',
        body: {
          type: 'object',
          properties: {
            game: {
              type: 'object', properties: {
                name: {type: 'string'},
                InitialBudget: {type: 'number'},
                InventoryAffectSales: {type: 'boolean'},
                carbon_policy: {
                  type: 'object',
                  properties: {
                    Option: {type: "number"},
                    Carbon_Tax: {type: "number"},
                    Carbon_Cap: {type: "number"},
                    Penalty: {type: "number"}
                  }
                },
                investment_options: {
                  type: 'object',
                  properties: {
                    IV_UProd_Em: {type: "number"},
                    A_P: {type: "number"},
                    IV_UHoldWP_Em: {type: "number"},
                    A_IWP: {type: "number"},
                    IV_UHoldWR_Em: {type: "number"},
                    A_IWR: {type: "number"}
                  }
                }
              }
            },
            months: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  index: {type: 'number'},
                  name: {type: 'string'},
                  label: {type: 'string'},
                  demand: {type: 'number'},
                  demandHistory: {type: 'number'}
                }
              }
            },
            production: {
              type: 'object',
              properties: productionProperties
            },
            distribution: {
              type: 'object',
              properties: distributionProperties
            },
            sales: {
              type: 'object',
              properties: saleProperties
            },
            advertisements: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  option: {type: 'number'},
                  Yield_Impact: {type: 'number'},
                  Budget: {type: 'number'},
                  Comment: {type: 'string'}
                }
              }
            }
            

          }
        },      
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              GameId: {type: 'string'},
              sucess: { type: 'boolean' },
              message: {type: 'string'}
            }
          }
        }
      }
    }
    , 
    async function (req, res) {
      //let game = await Model.games.findOne({_id: request.params.id})
      let game = await Model.games.findOneAndUpdate({name: req.body.game.name},{$set: req.body.game},{upsert: true,new: true})
      // game = game || await Model.games.create(req.body.game)
      let production = await Model.productions.findOneAndUpdate({game: game.id},{$set: req.body.production},{upsert: true, new: true})
      let distribution = await Model.distributions.findOneAndUpdate({game: game.id},{$set: req.body.distribution},{upsert: true, new: true})
      let sale = await Model.sales.findOneAndUpdate({game: game.id},{$set: req.body.sales},{upsert: true, new: true})

      let periods = []
      for(let p of req.body.months){
        periods.push(Object.assign(p,{game: game.id}))
      }
      let months = await Model.periods.insertMany(periods)
      //let teams = await Model.teams.insertMany(req.body.teams.map(team => {return {name: team,game:game._id}}))
      //let teamIds = req.body.teams.map(team => {return {team: team,game:game._id}})
      //await Model.teamValues.insertMany(teamIds)
      let advertisementVals = req.body.advertisements.map(adv => {return Object.assign(adv, {game: game.id})})
      await Model.advertisements.insertMany(advertisementVals)
      //Util.initInvtW({game_id: game._id, teams: teams, months: months, production: production, sale: sale})
      res.send({sucess: true, GameId: game.id})
    
  })




  
  fastify.post('/:id/start',
    {
      schema: {
        description: 'Start a game play , init months and stages',
        tags: ['game'],
        summary: 'Start a game play',  
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Game id'
            }
          }
        },   
         body: {
          type: 'object',
          properties: {
              interval: {type: 'number'}
          }
        },
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              team: { type: 'object', properties: {name: {type: 'string'}, description: {type: 'string'}} },
              sucess: {type: 'boolean'}
            }
          }
        }
      }
    }
    , 
    async function (req, res) {

      let game = await Model.games.findOne({_id: req.params.id})
      Timer.start(game,req.body.interval);
      res.send({sucess: true})
  })

  fastify.post('/:id/restart',
    {
      schema: {
        description: 'Restart a game play , at certain month and stage',
        tags: ['game'],
        summary: 'Restart a game play at specific month and stage',  
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Game id'
            }
          }
        }, 
        body: {
          type: 'object',
          properties: {
              month: {type: 'number'},
              stage: {type: 'number'},
              interval: {type: 'number'}
          }
        },            
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              team: { type: 'object', properties: {name: {type: 'string'}, description: {type: 'string'}} },
              sucess: {type: 'boolean'}
            }
          }
        }
      }
    }
    , 
    async function (req, res) {
      let game = await Model.games.findOne({_id: req.params.id});
      Timer.restart(game,req.body.interval,req.body.month,req.body.stage);
      res.send({sucess: true});
  })



  
  fastify.post('/:id/stop',
    {
      schema: {
        description: 'Stop a game play , reset months and stages',
        tags: ['game'],
        summary: 'Stop a game play',  
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Game id'
            }
          }
        },   
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              team: { type: 'object', properties: {name: {type: 'string'}, description: {type: 'string'}} },
              sucess: {type: 'boolean'}
            }
          }
        }
      }
    }
    , 
    async function (req, res) {
      let game = await Model.games.findOne({_id: req.params.id})
      Timer.stop(game);
      res.send({sucess: true})
  })
  

  fastify.post('/:id/pause',
    {
      schema: {
        description: 'Pause a game play',
        tags: ['game'],
        summary: 'Pause a game play',  
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Game id'
            }
          }
        },   
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              team: { type: 'object', properties: {name: {type: 'string'}, description: {type: 'string'}} },
              sucess: {type: 'boolean'}
            }
          }
        }
      }
    }
    , 
    async function (req, res) {
      let game = await Model.games.findOne({_id: req.params.id})
      Timer.pause(game);
      res.send({sucess: true})
  })

  fastify.post('/:id/resume',
    {
      schema: {
        description: 'Resume a game play ',
        tags: ['game'],
        summary: 'Resume a game play',  
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Game id'
            }
          }
        },   
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              team: { type: 'object', properties: {name: {type: 'string'}, description: {type: 'string'}} },
              sucess: {type: 'boolean'}
            }
          }
        }
      }
    }
    , 
    async function (req, res) {
      let game = await Model.games.findOne({_id: req.params.id})
      Timer.resume(game);
      res.send({sucess: true})
  })

  fastify.get('/:id/status',
    {
      schema: {
        description: 'Return game status',
        tags: ['game'],
        summary: 'Return game status with remaining time',  
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Game id'
            }
          }
        },   
        response: {
          // 200: {
          //   description: 'Successful response',
          //   type: 'object',
          //   properties: {
          //     team: { type: 'object', properties: {name: {type: 'string'}, description: {type: 'string'}} },
          //     sucess: {type: 'boolean'}
          //   }
          // }
        }
      }
    }
    , 
    async function (req, res) {
      let game = await Model.games.findOne({_id: req.params.id})
      let remaining = 0
      console.log("Game status request")
      if(game.status !== "stopped")
         remaining = await Timer.remaining(game);
      res.send({sucess: true, status: game.status, interval: game.interval, remaining: remaining, currentMonth: game.currentMonth, currentStage: game.currentStage})
  })

  fastify.get('/:id/months',
    {
      schema: {
        description: 'Return game with their periods',
        tags: ['game'],
        summary: 'Return list of months with their description and the game name',  
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Game id'
            }
          }
        },   
        response: {
          // 200: {
          //   description: 'Successful response',
          //   type: 'object',
          //   properties: {
          //     team: { type: 'object', properties: {name: {type: 'string'}, description: {type: 'string'}} },
          //     sucess: {type: 'boolean'}
          //   }
          // }
        }
      }
    }
    , 
    async function (req, res) {
    const data = await getMonths(req)
    res.send({sucess: true, data})
  })

  async function getMonths(req){
      const game = await Model.games.findOne({_id: req.params.id})
      const months = await Model.periods.find({game: req.params.id}).sort('index')
      const production = await Model.productions.findOne({game: req.params.id})
      const advertisements = await Model.advertisements.find({game: req.params.id})
      const distribution = await Model.distributions.findOne({game: req.params.id})
      const sales = await Model.sales.findOne({game: req.params.id})

      return {game,production,distribution,sales,months,advertisements}     
  }

  fastify.get('/:id/teams',
    {
      schema: {
        description: 'Return list of teams',
        tags: ['game'],
        summary: 'Return list of teams associated with the game',  
        params: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Game id'
            }
          }
        },   
        response: {
        
        }
      }
    }
    , 
    async function (req, res) {
      //let game = await Model.games.findOne({_id: req.params.id})
      let teams = await Model.teams.find({game: req.params.id})

      res.send({sucess: true, teams})
  })

  fastify.get('/:name/get_teams',
    {
      schema: {
        description: 'Return list of teams',
        tags: ['game'],
        summary: 'Return list of teams associated with the game',  
        params: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Game Name'
            }
          }
        },   
        response: {
        
        }
      }
    }
    , 
    async function (req, res) {
      let game = await Model.games.findOne({name: req.params.name})
      let teams = await Model.teams.find({game: req.params.id})

      res.send({sucess: true, game, teams})
  })



  next()
}