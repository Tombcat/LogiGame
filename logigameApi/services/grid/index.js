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


  fastify.get('/:game_id/:team/production',
      async (req, res) => {

        let months = await findPlayerValues(req.params.game_id,req.params.team)
        let game = await Model.games.findOne({_id: req.params.game_id})

        let columnDefs = [
          {headerName: 'Month', field: 'month'},
          {headerName: 'How Much to Produce', field: 'Qt', type: 'numericColumn',editable: true,cellClass: 'bg-green-2'},
          {headerName: 'Warehouse W1 Inventory Status', children: [
              {headerName: 'Bigenning of month', field: 'InvtWPB'},
              {headerName: 'End of month', field: 'InvtWPE'},
            ]}
        ]

        let rowData = []
        let editingIndex = 0;

        for (let month of months){

          if(month.playerValues.Qt){
                editingIndex+=1
           }

          rowData.push({
            month: month.label,
            month_index: month.index,
            Qt: month.playerValues.Qt,
            InvtWPB: month.playerValues.InvtWPB_i,
            InvtWPE: month.playerValues.InvtWPE_i,
          })
        }

        console.debug("--------------------------------------------------  Grid PRoduction --------------------------------------------------", rowData)
    
      
        res.send({columnDefs: columnDefs, rowData: rowData,editingIndex: editingIndex,currentMonth: game.currentMonth,currentStage: game.currentStage, gameStatus: game.status})

      }
    )



  fastify.get('/:game_id/:team/distribution',
      async (req, res) => {

        let months = await findPlayerValues(req.params.game_id,req.params.team)
        let game = await Model.games.findOne({_id: req.params.game_id})


        let columnDefs = [
          {headerName: 'Month', field: 'month',width: 100},
          {headerName: 'Items at Warehouse#1', field: 'InvtWPE'},
          {headerName: 'Transportation Decisions', children: [
              {headerName: 'Ship by boat', field: 'QTS_i', type: 'numericColumn',editable: true,width: 150,cellClass: 'bg-green-2'},
              {headerName: 'Ship by air', field: 'QTA_i', type: 'numericColumn',editable: true,width: 150,cellClass: 'bg-green-2'},
            ]},
          {headerName: 'Warehouse W2 Inventory Status', children: [
              {headerName: 'Bigenning of month', field: 'InvtWRB',width: 150},
              {headerName: 'End of month', field: 'InvtWRE',width: 150},
            ]}  
        ]

        let rowData = []
        let editingIndex = 0;

        for (let month of months){
          
          if(month.playerValues.QTS_i && month.playerValues.QTA_i){
              editingIndex+=1
          }

          rowData.push({
            month: month.label,
            month_index: month.index,
            QTS_i: month.playerValues.QTS_i,
            QTA_i: month.playerValues.QTA_i,
            InvtWPE: month.playerValues.InvtWPE_i,
            InvtWRB: month.playerValues.InvtWRB_i,
            InvtWRE: month.playerValues.InvtWRE_i
          })
        }
    
      
        res.send({columnDefs: columnDefs, rowData: rowData,editingIndex: editingIndex,currentMonth: game.currentMonth,currentStage: game.currentStage,gameStatus: game.status})

      }
    )

  fastify.get('/:game_id/:team/sales',
      async (req, res) => {

        let months = await findPlayerValues(req.params.game_id,req.params.team)
        let game = await Model.games.findOne({_id: req.params.game_id})

        let ads = await Model.advertisements.find({game: req.params.game_id}).sort('option').lean()
        let columnDefs = [
          {headerName: 'Month', field: 'month',width: 100},
          {headerName: 'Warehouse#2', field: 'InvtWRE',width: 120},
          {headerName: 'Price', field: 'price', editable: true,cellClass: 'bg-green-2',width: 100, valueFormatter: currencyFormatter},
          {headerName: 'Advertisement budget increase %', children: [
              {headerName: 'Budget', field: 'Adv_i',editable: true,width: 100,cellClass: 'bg-green-2'},
              {headerName: 'Increase %', field: 'Comment',width: 100},
            ]},
          {headerName: 'Forecast', field: 'Forecast',width: 100},
          {headerName: 'Real Demand', field: 'RealDemand',width: 120},
          {headerName: 'Real Sales', field: 'Sales',width: 100},
          {headerName: 'Lost Sales', field: 'LostSales',width: 100},
          {headerName: 'Revenu', field: 'Revenu',width: 100}

        ]

        let rowData = []
        let editingIndex = 0;
        for (let month of months){
          let ad = ads.find(ad => ad.option == month.playerValues.Advertisement)
          if(ad && month.playerValues.Price){
            editingIndex+=1
          }
          rowData.push({
            month: month.label,
            month_index: month.index,
            price: month.playerValues.Price,
            InvtWRE: month.playerValues.InvtWRE_i,
            Adv_i: ad ? ad.Budget : 0, //month.playerValues.Advertisement,
            Comment: ad ? ad.Comment : '',
            Forecast: month.demand,
            RealDemand: month.playerValues.RealDemand,
            Sales: month.playerValues.Sales,
            LostSales: month.playerValues.LostSales,
            Revenu: month.playerValues.Revenu_i
          })
        }
    
        let advertisements = ads.map(ad => ad.Budget)
        res.send({columnDefs: columnDefs, rowData: rowData,advertisements: advertisements,editingIndex: editingIndex,currentMonth: game.currentMonth,currentStage: game.currentStage,gameStatus: game.status})
        function currencyFormatter(params) {
            return '€' + formatNumber(params.value);
        }

      }
    )


  next()
}


