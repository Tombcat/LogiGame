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
    InitialDemand: { type: 'number', description: "12 month demand given by the moderator" },
    DeltaPrice: { type: 'number', description: "DeltaPrice to be used in sales" },
    InitialPrice: { type: 'number', description: "InitialPrice to be used in sales" },
    MarketType: {type: 'string', description: 'independant or shared market'},
    DemandType: {type: 'string', description: 'stochastic or deterministic'},
    PED: { type: 'number', description: "Price Demand Elasticity Factor" },

}

module.exports = function (fastify, opts, next) {


  fastify.post('/:game_id/:team/:month/invest_ap', 
    {
      //
      schema: {
        description: 'Invest for Emission Reduction in Production ',
        tags: ['manager'],
        summary: 'Submit Month To Invest for Emission Reduction in Production',
        params: {
          type: 'object',
          properties: {
            game_id: { type: 'string' , description: "Game ID"},
            month: { type: 'number' , description: "Month index"},
            team: { type: 'string' , description: "Team Name"}
          }
        },
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              success: { type: 'boolean' }
            }
          }
        }
      }
    },

    async (req, res) => {
      await Model.teamValues.findOneAndUpdate({game: req.params.game_id,team: req.params.team},{$set: {
              A_P_Month: req.params.month
            }}, {new: true});
      // recalculate emission
      Util.calculateEmissionWP({game_id: req.params.game_id,team: req.params.team})
      res.send({success: true})
    }

  )

  fastify.post('/:game_id/:team/:month/invest_iwp', 
    {
      //
      schema: {
        description: 'Invest for Emission Reduction in Production Inventory ',
        tags: ['manager'],
        summary: 'Submit Month To Invest for Emission Reduction in Production Inventory',
        params: {
          type: 'object',
          properties: {
            game_id: { type: 'string' , description: "Game ID"},
            month: { type: 'number' , description: "Month index"},
            team: { type: 'string' , description: "Team Name"}
          }
        },
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              success: { type: 'boolean' }
            }
          }
        }
      }
    },

    async (req, res) => {
      await Model.teamValues.findOneAndUpdate({game: req.params.game_id,team: req.params.team},{$set: {
              A_IWP_Month: req.params.month
            }}, {new: true});
      // recalculate emission
      Util.calculateEmissionWP({game_id: req.params.game_id,team: req.params.team})

      res.send({success: true})
    }

  )


  fastify.post('/:game_id/:team/:month/invest_iwr', 
    {
      //
      schema: {
        description: 'Invest for Emission Reduction in Retail Inventory ',
        tags: ['manager'],
        summary: 'Submit Month To Invest for Emission Reduction in Retail Inventory',
        params: {
          type: 'object',
          properties: {
            game_id: { type: 'string' , description: "Game ID"},
            month: { type: 'number' , description: "Month index"},
            team: { type: 'string' , description: "Team Name"}
          }
        },
        response: {
          200: {
            description: 'Successful response',
            type: 'object',
            properties: {
              success: { type: 'boolean' }
            }
          }
        }
      }
    },

    async (req, res) => {
      await Model.teamValues.findOneAndUpdate({game: req.params.game_id,team: req.params.team},{$set: {
              A_IWR_Month: req.params.month
            }}, {new: true});
      // recalculate emission
      Util.calculateRW_Cost_EM({game_id: req.params.game_id,team: req.params.team})

      res.send({success: true})
    }

  )


  
  fastify.get('/:game_id/:team/supply_chain', 
    {
      //
      schema: {
        description: 'Get supply chain summary ',
        tags: ['manager'],
        summary: 'Get supply chain summary for all months',
        params: {
          type: 'object',
          properties: {
            game_id: { type: 'string' , description: "Game ID"},
            team: { type: 'string' , description: "Team Name"}
          }
        },
        response: {
          // 200: {
          //   description: 'Successful response',
          //   type: 'object',
          //   properties: {

          //     success: { type: 'boolean' }
          //   }
          // }
        }
      }
    },

    async (req, res) => {
      let months = await Model.periods.find({game: req.params.game_id}).sort('index')
      let game = await Model.games.findOne({_id: req.params.game_id})
      let results = [];
      let advertisements = await Model.advertisements.find({game: req.params.game_id}).lean()
      for(let month of months){
        await Util.calculateProductionCost_ForMonth({game_id: req.params.game_id,team: req.params.team,month: month._id})
        //await Util.calculateEmissionWP_ForMonth({game_id: req.params.game_id,team: req.params.team,month: month._id})
        await Util.calculateRW_Cost_EM_ForMonth({game_id: req.params.game_id,team: req.params.team,month: month._id})       
      }
      
      let months_ids = months.map(pp => pp._id);
      let ppMonths = await Model.playerProductions.find({team: req.params.team, month: {$in:months_ids}}).populate('month');
      function compare( a, b ) {
        if ( a.month.index < b.month.index ){
          return -1;
        }
        if ( a.month.index > b.month.index ){
          return 1;
        }
        return 0;
      }

      ppMonths.sort(compare)
      //let ppMonths = await Model.playerProductions.find({team: req.params.team}).populate('month')
      let teamValue = await Model.teamValues.findOne({game: req.params.game_id,team: req.params.team});

      let cashFlow = ppMonths[1]

      for(let [index, pp] of ppMonths.entries()){
         let adv = advertisements.find(adv => adv.option == pp.Advertisement);
         let carbon_investments = '';
         if(pp.month.index == teamValue.A_P_Month){
          carbon_investments += 'IV_UProd_Em:'+game.investment_options.IV_UProd_Em+' '
         }
         if(pp.month.index == teamValue.A_IWP_Month){
          carbon_investments += 'IV_UHoldWP_Em:'+game.investment_options.IV_UHoldWP_Em+' '
         }
         if(pp.month.index == teamValue.A_IWR_Month){
          carbon_investments += 'IV_UHoldWR_Em:'+game.investment_options.IV_UHoldWR_Em+' '
         }
         
         let net_profit = pp.Revenu_i-(pp.TotalProdCost+pp.TotalTranspCost+pp.InvtWR_HoldingCost)

         let data = {
            month: pp.month.label,
            profits: {
              net: net_profit,
              revenu: pp.Revenu_i,
              cashFlow: net_profit+game.InitialBudget
            },
            costs: {
              total: pp.TotalProdCost+pp.TotalTranspCost+pp.InvtWR_HoldingCost,
              production: pp.TotalProdCost,
              Prod_Cost: pp.ProdCost,
              inventory: {
                wp: pp.InvtWP_HoldingCost,
                wr: pp.InvtWR_HoldingCost,
                total: pp.InvtWP_HoldingCost+pp.InvtWR_HoldingCost
              },
              transportation: {
                total: pp.TotalTranspCost,
                air: pp.Air_Cost,
                sea: pp.Sea_Cost
              },
              advertisement: adv ? adv.Comment : 'No Adv',
              carbon_investment: carbon_investments
            },
            emissions: {
              total: pp.TotalProdEm+pp.TotalTranspEm+pp.InvtWR_EmLevel,
              production: pp.TotalProdEm-pp.InvtWP_EmLevel,
              inventory:{
                wp: pp.InvtWP_EmLevel,
                wr: pp.InvtWR_EmLevel,
                total: pp.InvtWP_EmLevel+pp.InvtWR_EmLevel
              },
              transportation: pp.TotalTranspEm
            }
            
         };
        results.push(data) 
      }

      let totalProfit = ppMonths.reduce((prev,next) => {return {Revenu_i: prev.Revenu_i+next.Revenu_i}}).Revenu_i
      console.log("TOTAL PROFIT.. ",totalProfit)
      let totalCost = teamValue.TotalProdCost+teamValue.TotalTranspCost+teamValue.InvtWR_HoldingCost
      let totalEm = teamValue.TotalProdEm+teamValue.TotalTranspEm+teamValue.InvtWR_EmLevel
      let summary = {
          results: results,
          totalProfit: totalProfit,
          totalCost: totalCost,
          netProfit: totalProfit-(totalCost)+game.InitialBudget,
          totalEmission: totalEm
      }
      if(game.carbon_policy.Option == 2){
        summary.totalCost = totalCost + game.carbon_policy.Carbon_Tax*totalEm
        summary.tax = game.carbon_policy.Carbon_Tax*totalEm
      }  
      if(game.carbon_policy.Option == 3 && game.carbon_policy.Carbon_Cap<totalEm){
        summary.totalCost = totalCost + game.carbon_policy.Penalty;
        summary.penalty = game.carbon_policy.Penalty;
      }      

      res.send({success: true, result: summary})
    }

  )


  next()
}