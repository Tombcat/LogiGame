'use strict'

// sale model

const Model = require('../../models/init')
const Util = require('../../lib/utils')

module.exports = function (fastify, opts, next) {
 
  async function findPlayerValues(game_id, team){

    return await Model.periods.aggregate(
        [
          {
            '$lookup': {
              'from': 'playerproductions', 
              'localField': '_id', 
              'foreignField': 'month', 
              'as': 'playerValues'
            }
          }, {
            '$unwind': {
              'path': '$playerValues', 
              'preserveNullAndEmptyArrays': false
            }
          }, {
            '$match': {
              'game': new Model.mongo.ObjectId(game_id), 
              'playerValues.team': team
            }
          }, {
            '$sort': {
              'index': 1
            }
          }
        ]
      )
  }

  async function currentMonthVal(game_id, vals){
    let game = await Model.games.findOne({_id: game_id})
    return vals[game.currentMonth]
  }

  fastify.get('/:game_id/:team/production-inventory',
      async (req, res) => {
        let game_id = req.params.game_id
        let playersValues = await findPlayerValues(game_id,req.params.team)
        let labels = playersValues.map(pv => pv.label)
        let production = await Model.productions.findOne({game: game_id})
        let invtWPB =  playersValues.map(pv => pv.playerValues.InvtWPB_i)
        let invtWPE =  playersValues.map(pv => pv.playerValues.InvtWPE_i)
        let datasets = [{label: 'Begin of Month',borderColor: '#64b5f6',data: invtWPB,fill: false},
                        {label: 'End of Month',borderColor: '#ff9800',data: invtWPE, fill: false}]
        let options= {title: {display: false, text: 'Production Inventory Level'},

              responsive: true,
            
              tooltips: {
                mode: 'index',
                intersect: false,
              },
              hover: {
                mode: 'nearest',
                intersect: true
              },
              // maintainAspectRatio: false
            }
    
      
        res.send({labels: labels, datasets: datasets, options: options,type: 'line',
          icon: 'https://img.icons8.com/dusk/100/000000/warehouse.png',
          title: 'Warehouse 1',
          subtitle: 'Production Inventory Level',
          global: await currentMonthVal(game_id,invtWPB),
          data: [
            {
              label: 'Estimation at End of the month',
              value:  await currentMonthVal(game_id,invtWPE),
            },
            {
              label: 'Capacity',
              value:  production.WP_Cap
            },
          ]

        })

      }
    )

  fastify.get('/:game_id/:team/retail-inventory',
      async (req, res) => {
        let game_id = req.params.game_id
        let playersValues = await findPlayerValues(game_id,req.params.team)
        let labels = playersValues.map(pv => pv.label)
        let sale = await Model.sales.findOne({game: game_id})
        let invtWRB =  playersValues.map(pv => pv.playerValues.InvtWRB_i)
        let invtWRE =  playersValues.map(pv => pv.playerValues.InvtWRE_i)
        let datasets = [{label: 'Begin of Month',borderColor: '#64b5f6',data: invtWRB,fill: false},
                        {label: 'End of Month',borderColor: '#ff9800',data: invtWRE, fill: false}]
        let options= {title: {display: false, text: 'Retail Inventory Level'},

              responsive: true,
            
              tooltips: {
                mode: 'index',
                intersect: false,
              },
              hover: {
                mode: 'nearest',
                intersect: true
              }
              
            }
    
      
        res.send({labels: labels, datasets: datasets, options: options,type: 'line', 
          icon: 'https://img.icons8.com/dusk/100/000000/warehouse.png',
          title: 'Warehouse 2',
          subtitle: 'Retail Inventory Level',
          global: await currentMonthVal(game_id,invtWRB),
          data: [
            {
              label: 'Estimation at End of the month',
              value:  await currentMonthVal(game_id,invtWRE)
            },
            {
              label: 'Capacity',
              value:  sale.WR_Cap
            },
          ]
          })

      }
    )

  fastify.get('/:game_id/:team/production',
      async (req, res) => {

        let playersValues = await findPlayerValues(req.params.game_id,req.params.team)

        let labels = playersValues.map(pv => pv.label)
        let Qt =  playersValues.map(pv => pv.playerValues.Qt)

        let datasets = [{label: 'Production',backgroundColor: '#64b5f6',data: Qt}]
        let options= {title: {display: true, text: 'Production'}}
        res.send({labels: labels, datasets: datasets, options: options})

      }
    )



  fastify.get('/:game_id/:team/production-cost',
      async (req, res) => {
        let game_id = req.params.game_id
        let playersValues = await findPlayerValues(game_id,req.params.team)
        let labels = playersValues.map(pv => pv.label)
        let PCost =  playersValues.map(pv => pv.playerValues.ProdCost)
        let HoldingCost = playersValues.map(pp => pp.playerValues.InvtWP_HoldingCost+pp.playerValues.InvtWR_HoldingCost)
        
        
        let datasets = [{label: 'Production',backgroundColor: '#64b5f6',data: PCost},
                        {label: 'Inventory Holding',backgroundColor: '#ff9800',data: HoldingCost}
                        ]
        let options = {
          title: {
            display: false,
            text: 'Production Cost'
          },
          tooltips: {
            mode: 'index',
            intersect: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              stacked: true,
            }],
            yAxes: [{
              stacked: true
            }]
          }

        }
        let p_cost = await currentMonthVal(game_id,PCost)
        let i_holding = await currentMonthVal(game_id,HoldingCost)
        res.send({labels: labels, datasets: datasets, options: options,
          icon: 'https://img.icons8.com/office/80/000000/factory.png',
          title: 'Production Cost',
          global: p_cost+i_holding,
          prefix: '$',
          data: [
            {
              label: 'Production',
              value:  p_cost
            },
            {
              label: 'Inventory Holding',
              value:  i_holding
            }
          ]

        })

      }
    )


  fastify.get('/:game_id/:team/distribution-cost',
      async (req, res) => {
        let game_id = req.params.game_id
        let playersValues = await findPlayerValues(game_id,req.params.team)
        let labels = playersValues.map(pv => pv.label)
        let AirCost =  playersValues.map(pv => pv.playerValues.Air_Cost)
        let SeaCost = playersValues.map(pp => pp.playerValues.Sea_Cost)
        
        
        let datasets = [{label: 'Air Transportation',backgroundColor: '#64b5f6',data: AirCost},
                        {label: 'Sea Transportation',backgroundColor: '#ff9800',data: SeaCost}
                        ]
        let options = {
          title: {
            display: false,
            text: 'Distribution Cost'
          },
          tooltips: {
            mode: 'index',
            intersect: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              stacked: true,
            }],
            yAxes: [{
              stacked: true
            }]
          }

        }
        let air_cost = await currentMonthVal(game_id,AirCost)
        let sea_cost = await currentMonthVal(game_id,SeaCost)
        res.send({labels: labels, datasets: datasets, options: options,
          icon: 'https://img.icons8.com/nolan/64/000000/move-stock.png',
          title: 'Distribution Cost',
          global: air_cost+sea_cost,
          prefix: '$',
          data: [
            {
              label: 'Air Transportation',
              value:  air_cost
            },
            {
              label: 'Sea Transportation',
              value:  sea_cost
            }
          ]

        })

      }
    )


  fastify.get('/:game_id/:team/cost',
      async (req, res) => {

        let playersValues = await findPlayerValues(req.params.game_id,req.params.team)
        let labels = playersValues.map(pv => pv.label)
        let PCost =  playersValues.map(pv => pv.playerValues.ProdCost)
        let HoldingCost = playersValues.map(pp => pp.playerValues.InvtWP_HoldingCost+pp.playerValues.InvtWR_HoldingCost)
        let TCost = playersValues.map(pp => pp.playerValues.TotalTranspCost)
        
        let datasets = [{name: 'Production',backgroundColor: '#64b5f6',data: PCost},
                        {name: 'Inventory Holding',backgroundColor: '#ff9800',data: HoldingCost},
                        {name: 'Transportation',backgroundColor: '##81c784',data: TCost}
                        ]
        let options = {
          title: {
            display: false,
            text: 'Cost'
          },
          tooltips: {
            mode: 'index',
            intersect: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              stacked: true,
            }],
            yAxes: [{
              stacked: true
            }]
          }
        }
        res.send({labels: labels, datasets: datasets, options: options})

      }
    )

  fastify.get('/:game_id/:team/production-emission',
      async (req, res) => {
        let game_id = req.params.game_id
        let playersValues = await findPlayerValues(game_id,req.params.team)
        let labels = playersValues.map(pv => pv.label)
        let PEmission =  playersValues.map(pv => pv.playerValues.TotalProdEm)
        let HoldingEm = playersValues.map(pp => pp.playerValues.InvtWP_EmLevel+pp.playerValues.InvtWR_EmLevel)
        
        let datasets = [{name: 'Production',backgroundColor: '#64b5f6',data: PEmission},
                        {name: 'Inventory Holding',backgroundColor: '#ff9800',data: HoldingEm}
                        ]
        let options = {
          title: {
            display: false,
            text: 'Emission'
          },
          tooltips: {
            mode: 'index',
            intersect: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              stacked: true,
            }],
            yAxes: [{
              stacked: true
            }]
          }
        }
        let p_emission = await currentMonthVal(game_id,PEmission)
        let i_holding = await currentMonthVal(game_id,HoldingEm)
        res.send({labels: labels, datasets: datasets, options: options,
          icon: 'https://img.icons8.com/ios/100/000000/co2-gauge.png',
          title: 'Production Emission',
          global: p_emission+i_holding,
          data: [
            {
              label: 'Production',
              value:  p_emission
            },
            {
              label: 'Inventory Holding',
              value:  i_holding
            }
          ]
        })

      }
    )


  fastify.get('/:game_id/:team/distribution-emission',
      async (req, res) => {
        let game_id = req.params.game_id
        let playersValues = await findPlayerValues(game_id,req.params.team)
        let labels = playersValues.map(pv => pv.label)
        let TranspEm_AIR =  playersValues.map(pv => pv.playerValues.TranspEm_AIR)
        let TranspEm_SEA = playersValues.map(pp => pp.playerValues.TranspEm_SEA)
        
        let datasets = [{label: 'Air Transportation',backgroundColor: '#64b5f6',data: TranspEm_AIR},
                        {label: 'Sea Transportation',backgroundColor: '#ff9800',data: TranspEm_SEA}
                        ]
        let options = {
          title: {
            display: false,
            text: 'Emission'
          },
          tooltips: {
            mode: 'index',
            intersect: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              stacked: true,
            }],
            yAxes: [{
              stacked: true
            }]
          }
        }
        let air_em = await currentMonthVal(game_id,TranspEm_AIR)
        let sea_em = await currentMonthVal(game_id,TranspEm_SEA)
        res.send({labels: labels, datasets: datasets, options: options,
          icon: 'https://img.icons8.com/ios/100/000000/co2-gauge.png',
          title: 'Distribution Emission',
          global: air_em+sea_em,
          data: [
            {
              label: 'Air Transportation',
              value:  air_em
            },
            {
              label: 'Sea Transportation',
              value:  sea_em
            }
          ]
        })

      }
    )

  fastify.get('/:game_id/:team/sales-forecast',
      async (req, res) => {
        let game_id = req.params.game_id
        let playersValues = await findPlayerValues(game_id,req.params.team)
        let labels = playersValues.map(pv => pv.label)

        let SForecast =  playersValues.map(pv => pv.demand)
        
        
        let datasets = [{label: 'Forecast',backgroundColor: '#64b5f6',data: SForecast}
                        ]
        let options = {
          title: {
            display: false,
            text: 'Forecast'
          },
          tooltips: {
            mode: 'index',
            intersect: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              stacked: true,
            }],
            yAxes: [{
              stacked: true
            }]
          }
        }
        let c_forecast = await currentMonthVal(game_id,SForecast)
        res.send({labels: labels, datasets: datasets, options: options,
          icon: 'https://img.icons8.com/clouds/100/000000/shopping-bag.png',
          title: 'Forecast',
          global: c_forecast,
          data: []
        })

      }
    )

  fastify.get('/:game_id/:team/sales-performance',
      async (req, res) => {
        let game_id = req.params.game_id
        let playersValues = await findPlayerValues(game_id,req.params.team)
        let labels = playersValues.map(pv => pv.label)

        let RealDemand =  playersValues.map(pv => pv.RealDemand)
        let Sales =  playersValues.map(pv => pv.Sales)
        let LostSales =  playersValues.map(pv => pv.LostSales)
        
        
        let datasets = []
        let options = {
          title: {
            display: false,
            text: 'Sales Performance'
          },
          tooltips: {
            mode: 'index',
            intersect: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              stacked: true,
            }],
            yAxes: [{
              stacked: true
            }]
          }
        }
        let real_demand = await currentMonthVal(game_id,RealDemand)
        let sales = await currentMonthVal(game_id,Sales)
        let lost_sales = await currentMonthVal(game_id,LostSales)

        res.send({labels: labels, datasets: datasets, options: options,
          icon: 'https://img.icons8.com/clouds/100/000000/shopping-bag.png',
          title: 'Sales Performance',
          global: sales,
          data: [
            {
              label: 'Real Demand:',
              value:  real_demand
            },
            {
              label: 'Sales:',
              value:  sales
            },
            {
              label: 'Lost Sales:',
              value:  lost_sales
            }
          ]
        })

      }
    )


  fastify.get('/:game_id/:team/emission',
      async (req, res) => {

        let playersValues = await findPlayerValues(req.params.game_id,req.params.team)
        let labels = playersValues.map(pv => pv.label)
        let PEmission =  playersValues.map(pv => pv.playerValues.TotalProdEm)
        let HoldingEm = playersValues.map(pp => pp.playerValues.InvtWP_EmLevel+pp.playerValues.InvtWR_EmLevel)
        let TEmission = playersValues.map(pp => pp.playerValues.TotalTranspEm)
        let datasets = [{name: 'Production',backgroundColor: '#64b5f6',data: PEmission},
                        {name: 'Inventory Holding',backgroundColor: '#ff9800',data: HoldingEm},
                        {name: 'Transportation',backgroundColor: '##81c784',data: TEmission}
                        ]
        let options = {
          title: {
            display: false,
            text: 'Emission'
          },
          tooltips: {
            mode: 'index',
            intersect: false
          },
          responsive: true,
          scales: {
            xAxes: [{
              stacked: true,
            }],
            yAxes: [{
              stacked: true
            }]
          }
        }
        res.send({labels: labels, datasets: datasets, options: options})

      }
    )



  next()
}


