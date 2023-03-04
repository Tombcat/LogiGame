const moment = require('moment')
const Model = require('../models/init');
// returns 0 if equale
// returns -1 if currentDate > monthStr
// returns 1 if currentDate < monthStr
function compareMonth(monthStr){
	let currentMonthStr = moment().format('MM');
	let month = monthStr.replace(/.+\/(\d+)\/.+/,'$1');
	if(currentMonthStr == month){
		return 0;
	}
	if(currentMonthStr > month){
		return 1;
	}
	if(currentMonthStr < month){
		return -1;
	}

}

// independent market
function calculateRealDemand_IM(opt){
	//console.log("CALCULATE DEMAND ON IM ... ",opt);
	let realDemand = (opt.month.demand*(1-opt.PED*(opt.price-opt.lastPrice)/opt.lastPrice))*(1+opt.Advertisement)

	return Math.round(realDemand);
}

function calculateRealDemand_SM(opt){
	console.log(" SM ----- DEMAND ",opt.month.demand)
	console.log(" SM ----- PED ",opt.PED)
	console.log(" SM ----- PRICE ",opt.price)
	console.log(" SM ----- AVG PRICE ",opt.avgPrice)
	console.log(" SM ----- Advertisement ",opt.Advertisement)
	
	let marketDemand = opt.month.demand;
	let realDemand = (marketDemand*(1-opt.PED*(opt.price-opt.avgPrice)/opt.avgPrice))*(1+opt.Advertisement)

	return Math.round(realDemand);
}

function calculateSaleMonth(opt){
	console.log("............. realDemand: ",opt.realDemand)
	console.log("............. InvtWRB_i: ",opt.InvtWRB_i)
	return Math.min(opt.realDemand,opt.InvtWRB_i)
}

// init inventories
async function initInvtW(opt){
	// let production = Model.productions.findOne({game: opt.game_id})
	// let months = Model.periods.find({game: opt.game_id}).sort('index').lean();
	let pProductions = [];
	for(team of opt.teams){
		for (let i =0; i < opt.months.length; i++) {
			let data = {
				month: opt.months[i]._id,
				team: team.name,
				InvtWPB_i: opt.production.InvtWPB_0,
				InvtWPE_i: opt.production.InvtWPB_0,
				InvtWRB_i: opt.production.InvtWRB_0,
				InvtWRE_i: opt.production.InvtWRB_0, 
				Qt: 0,
				QTA_i: 0,
				QTS_i: 0,
				Price: 0,
				Revenu_i: 0,
				ExpectedDemand: 0,
				RealDemand: opt.months[i].demand,
				Sales: 0,
				LostSales: 0,
				Advertisement: 0,
				CvProd: 1,
				TotalProdCost: 0,
				TotalProdEm: 0,
				TotalTranspCost: 0,
				TotalTranspEm: 0,
				TranspEm_AIR: 0,
				TranspEm_SEA: 0,
				InvtWR_HoldingCost: 0,
				InvtWR_EmLevel: 0

			}
			//if(i===0) // uncomment for initial price for only the first month
				data.Price = opt.sale.InitialPrice

			pProductions.push(data);
		}
	}
	// console.log("PLAYER PRODUCTIONs ... ",pProductions)
	// console.log("MONTHS ... ",opt.months)
	// console.log("TEAMS ... ",opt.teams)
	await	Model.playerProductions.insertMany(pProductions);

	console.log("init all players inventories for game ...", opt.game_id);

}

async function calculateRW_Cost_EM(opt){
	
	let game = await Model.games.findOne({_id: opt.game_id})
	let teamValue = await Model.teamValues.findOne({team: opt.team, game: opt.game_id})
	let AiwrMonthIndex = teamValue.A_IWR_Month;
	let Aiwr = game.investment_options.A_IWR; 
	//console.log("AIWR RRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRRrr ",Aiwr)
	let sale = await Model.sales.findOne({game: opt.game_id})
	let months_ids = opt.months.map(pp => pp._id);
	let ppMonths = await Model.playerProductions.find({team: opt.team, month: {$in:months_ids}}).populate('month');
	let invtWREs = ppMonths.map(pp => {return {InvtWRE_i: pp.InvtWRE_i,month: pp.month.index}});
	let invtHoldingCost = invtWREs.reduce((prev,next) => {return {InvtWRE_i: prev.InvtWRE_i+next.InvtWRE_i*sale.UHoldWR_Cost}}).InvtWRE_i;
	let invtEmLevel = invtWREs.reduce((prev,next) => {return {InvtWRE_i: prev.InvtWRE_i+next.InvtWRE_i*sale.UHoldWR_Em*(1-((AiwrMonthIndex && next.month>=AiwrMonthIndex) ? Aiwr : 0))}}).InvtWRE_i
	/*console.log('------------------------------------------------')
	console.log('------------------------------------------------')
	console.log("CALCULATE WAREHOUSE COST EMISSION 1.... ")
	console.log('-----------------invtEmLevel-------------------------------',invtEmLevel)
	console.log('-----------------invtHoldingCost-------------------------------',invtHoldingCost)*/
	await Model.teamValues.findOneAndUpdate({team: opt.team, game: opt.game_id},{$set: {
		InvtWR_HoldingCost: invtHoldingCost,
		InvtWR_EmLevel: invtEmLevel
	}},{new: true, upsert: true})
}


async function calculateRW_Cost_EM_ForMonth(opt){
	//let month = await Model.periods.findOne({game: opt.game_id, index: opt.month})
	let game = await Model.games.findOne({_id: opt.game_id})
	let teamValue = await Model.teamValues.findOne({team: opt.team, game: opt.game_id})
	let AiwrMonthIndex = teamValue.A_IWR_Month;
	let AiwpMonthIndex = teamValue.A_IWP_Month;
	let Aiwr = game.investment_options.A_IWR; 
	let Aiwp = game.investment_options.A_IWP; 

	let sale = await Model.sales.findOne({game: opt.game_id})
	let production = await Model.productions.findOne({game: opt.game_id})
	let ppMonth = await Model.playerProductions.findOne({team: opt.team,month: opt.month}).populate('month');

	//let invtWRE = {InvtWRE_i: ppMonth.InvtWRE_i,month: ppMonth.month.index};
	//let invtWREs = ppMonths.map(pp => {return {InvtWRE_i: pp.InvtWRE_i,month: pp.month.index}});
	let invtHoldingCost = ppMonth.InvtWRE_i*sale.UHoldWR_Cost;
	let invtEmLevel = ppMonth.InvtWRE_i*sale.UHoldWR_Em*(1-((AiwrMonthIndex && ppMonth.month.index>=AiwrMonthIndex) ? Aiwr : 0))

	let InvtWP_HoldingCost = ppMonth.InvtWPE_i*production.UHoldWP_Cost;
	let InvtWP_EmLevel = ppMonth.InvtWPE_i*production.UHoldWP_Em*(1-((AiwpMonthIndex && ppMonth.month.index>=AiwpMonthIndex) ? Aiwp : 0));

	/*console.log('------------------------------------------------')
	console.log('------------------------------------------------')
	console.log("CALCULATE WAREHOUSE COST EMISSION 2.... ")
	console.log('-----------------invtEmLevel-------------------------------',invtEmLevel)
	console.log('-----------------invtHoldingCost-------------------------------',invtHoldingCost)*/

	ppMonth.InvtWR_HoldingCost= invtHoldingCost;
	ppMonth.InvtWP_HoldingCost= InvtWP_HoldingCost;
	ppMonth.InvtWR_EmLevel= invtEmLevel;
	ppMonth.InvtWP_EmLevel= InvtWP_EmLevel;
	await ppMonth.save()
}



async function calculateEmissionWP(opt){
	let ppMonths = await Model.playerProductions.find({team: opt.team}).populate('month');
	let ppQts = ppMonths.map(pp => {return {qt: pp.Qt, month: pp.month.index}});
	let ppInvtPE = ppMonths.map(pp => {return {InvtWPE_i: pp.InvtWPE_i, month: pp.month.index}})
	let production = await Model.productions.findOne({game: opt.game_id})
	let game = await Model.games.findOne({_id: opt.game_id})
	let teamValue = await Model.teamValues.findOne({team: opt.team, game: opt.game_id})
	let ApMonthIndex = teamValue.A_P_Month;
	let Ap = game.investment_options.A_P; // TODO calculate
	let AiwpMonthIndex = teamValue.A_IWP_Month;
	let Aiwp = game.investment_options.A_IWP;


 	let prodEm = ppQts.reduce((prev,next) => {return {qt: prev.qt+production.UProd_Em*(1-((ApMonthIndex && next.month>=ApMonthIndex) ? Ap : 0))*next.qt}}).qt
	let invtEm = ppInvtPE.reduce((prev, next) => {return {InvtWPE_i: prev.InvtWPE_i+production.UHoldWP_Em*(1-((AiwpMonthIndex && next.month>=AiwpMonthIndex) ? Aiwp : 0))*next.InvtWPE_i}}).InvtWPE_i
	let totalProdEm = prodEm+invtEm;
	teamValue.TotalProdEm = totalProdEm;
	await teamValue.save()
}



async function calculateEmissionWP_ForMonth(opt){
	//let month = await Model.periods.findOne({game: opt.game_id, index: opt.month})
	let ppMonth = await Model.playerProductions.findOne({team: opt.team, month: opt.month}).populate('month');
	//let ppQts = ppMonths.map(pp => {return {qt: pp.Qt, month: pp.month.index}});
	//let ppInvtPE = ppMonths.map(pp => {return {InvtWPE_i: pp.InvtWPE_i, month: pp.month.index}})
	let production = await Model.productions.findOne({game: opt.game_id})
	let game = await Model.games.findOne({_id: opt.game_id})
	let teamValue = await Model.teamValues.findOne({team: opt.team, game: opt.game_id})
	let ApMonthIndex = teamValue.A_P_Month;
	let Ap = game.investment_options.A_P; // TODO calculate
	let AiwpMonthIndex = teamValue.A_IWP_Month;
	let Aiwp = game.investment_options.A_IWP;

  	let prodEm = production.UProd_Em*(1-((ApMonthIndex && ppMonth.month.index>=ApMonthIndex) ? Ap : 0))*ppMonth.Qt
	let invtEm = production.UHoldWP_Em*(1-((AiwpMonthIndex && ppMonth.month.index>=AiwpMonthIndex) ? Aiwp : 0))*ppMonth.InvtWPE_i
	let totalProdEm = prodEm//+invtEm;
	ppMonth.TotalProdEm = totalProdEm;
	await ppMonth.save()
}

async function calculateProductionCost(opt){
	console.log("--------------------------------------------------")
	console.log("--------------------------------------------------")
	console.log("CALCULATE PRODUCTION COST ...............")
	console.log("--------------------------------------------------")
	console.log("--------------------------------------------------")
	let production = opt.production;
	
	let months_ids = opt.months.map(pp => pp._id)
	let ppMonths = await Model.playerProductions.find({team: opt.team, month: {$in:months_ids}}).populate('month');

	let ppQts = ppMonths.map(pp => {return {qt: pp.Qt, month: pp.month.index}});
	let ppInvtPE = ppMonths.map(pp => {return {InvtWPE_i: pp.InvtWPE_i, month: pp.month.index}})
	let meanQt = ppQts.reduce((prev,next) => {return {qt: prev.qt+next.qt}}).qt/ppMonths.length
	let variance = ppQts.reduce((prev,next) => {return {qt: prev.qt+Math.pow(next.qt-meanQt,2)}}).qt/ppMonths.length
	 
	let cvProd = variance ? (meanQt/Math.sqrt(variance) || 1) : 0;

	let sumUProdCostQ = ppQts.reduce((prev,next) => {return {qt: prev.qt+production.UProd_Cost*next.qt}}).qt*(1+production.VarProd*cvProd)
	let sumUHoldCostQ = ppInvtPE.reduce((prev,next) => {return {InvtWPE_i: prev.InvtWPE_i+production.UHoldWP_Cost*next.InvtWPE_i}}).InvtWPE_i;

	let totalProdCost = sumUProdCostQ+sumUHoldCostQ;
	// add teamValues table
	
	// calculation emission cost
	let game = await Model.games.findOne({_id: opt.game_id})
	let teamValue = await Model.teamValues.findOne({team: opt.team, game: opt.game_id})
	let ApMonthIndex = teamValue.A_P_Month;
	let Ap = game.investment_options.A_P; // TODO calculate
	let AiwpMonthIndex = teamValue.A_IWP_Month;
	let Aiwp = game.investment_options.A_IWP;

	let prodEm = ppQts.reduce((prev,next) => {return {qt: prev.qt+production.UProd_Em*(1-((ApMonthIndex && next.month>=ApMonthIndex) ? Ap : 0))*next.qt}}).qt
	let invtEm = ppInvtPE.reduce((prev, next) => {return {InvtWPE_i: prev.InvtWPE_i+production.UHoldWP_Em*(1-((AiwpMonthIndex && next.month>=AiwpMonthIndex) ? Aiwp : 0))*next.InvtWPE_i}}).InvtWPE_i
	let totalProdEm = prodEm+invtEm;

	let dCost = await calculateTransportationCost(opt)
	console.log("TRANSPORTATION COST ... !! ",dCost);

	await Model.teamValues.findOneAndUpdate({team: opt.team, game: opt.game_id},{$set: {
		TotalProdCost: totalProdCost,
		TotalProdEm: totalProdEm,
		CvProd: cvProd,
		...dCost
	}},{new: true, upsert: true})

	//return cvProd;
}

async function calculateProductionCost_ForMonth(opt){
	let production = await Model.productions.findOne({game: opt.game_id});
	let ppMonth = await Model.playerProductions.findOne({team: opt.team, month: opt.month}).populate('month');
	//let ppQts = ppMonths.map(pp => {return {qt: pp.Qt, month: pp.month.index}});
	//let ppInvtPE = ppMonths.map(pp => {return {InvtWPE_i: pp.InvtWPE_i, month: pp.month.index}})
	let meanQt = ppMonth.Qt
	let variance = 0 //Math.pow(ppMonth.Qt-meanQt,2)
	 
	let cvProd = 0 //variance ? (meanQt/Math.sqrt(variance) || 1) : 0;

	let sumUProdCostQ = (production.UProd_Cost*ppMonth.Qt)*(1+production.VarProd*cvProd);
	let sumUHoldCostQ = production.UHoldWP_Cost*ppMonth.InvtWPE_i;
	// console.log("SUM U PROD COST ................")
	// console.log("SUM U PROD COST ................")
	// console.log("SUM U PROD COST ................",ppMonth.month.label)
	// console.log("SUM U PROD COST ................ QT /// ",ppMonth.Qt)
	// console.log("SUM U PROD COST ................cost ",sumUProdCostQ)
	let totalProdCost = sumUProdCostQ+sumUHoldCostQ;
	// add teamValues table
	
	// calculation emission cost
	let game = await Model.games.findOne({_id: opt.game_id})
	let teamValue = await Model.teamValues.findOne({team: opt.team, game: opt.game_id})
	let ApMonthIndex = teamValue.A_P_Month;
	let Ap = game.investment_options.A_P; // TODO calculate
	let AiwpMonthIndex = teamValue.A_IWP_Month;
	let Aiwp = game.investment_options.A_IWP;

	let prodEm = production.UProd_Em*(1-((ApMonthIndex && ppMonth.month.index>=ApMonthIndex) ? Ap : 0))*ppMonth.Qt
	let invtEm = production.UHoldWP_Em*(1-((AiwpMonthIndex && ppMonth.month.index>=AiwpMonthIndex) ? Aiwp : 0))*ppMonth.InvtWPE_i
	let totalProdEm = prodEm+invtEm;

	let dCost = await calculateTransportationCost_ForMonth(opt)

	let pp = Object.assign(ppMonth, {
		TotalProdCost: totalProdCost,
		TotalProdEm: totalProdEm,
		CvProd: cvProd,
		ProdCost: sumUProdCostQ,
		HoldCost: sumUHoldCostQ,
		...dCost
	})
	pp.save()
	// await Model.teamValues.findOneAndUpdate({team: opt.team, game: opt.game_id},{$set: {
	// 	...dCost
	// }},{new: true, upsert: true})

	//return cvProd;
}

async function calculateTransportationCost(opt){
	console.log("--------------------------------------------------")
	console.log("--------------------------------------------------")
	console.log("CALCULATE TRANSPORTATION COST ...............")
	console.log("--------------------------------------------------")
	console.log("--------------------------------------------------")
	let distribution = await Model.distributions.findOne({game: opt.game_id})
	let months_ids = opt.months.map(pp => pp._id)
	let ppMonths = await Model.playerProductions.find({team: opt.team,  'month': {$in:months_ids}}).lean();
	let QTAs = ppMonths.map(pp => pp.QTA_i)
	let QTSs = ppMonths.map(pp => pp.QTS_i)
	let totalTranspCost = QTAs.reduce((prev,qta) => prev+qta*distribution.UAir_Cost)+QTSs.reduce((prev,qts) => prev+distribution.Cont_Cost*(Math.ceil(qts/distribution.Cont_Cap)))
	let totalTranspEm = QTAs.reduce((prev,qta) => prev+qta*distribution.UAir_Em)+QTSs.reduce((prev,qts) => prev+distribution.Cont_Em*(Math.ceil(qts/distribution.Cont_Cap)))
	return {
		TotalTranspCost: totalTranspCost,
		TotalTranspEm: totalTranspEm
	}
}

async function calculateTransportationCost_ForMonth(opt){
	//let month = await Model.periods.findOne({game: opt.game_id, index: opt.month})
	let distribution = await Model.distributions.findOne({game: opt.game_id})
	let ppMonth = await Model.playerProductions.findOne({team: opt.team, month: opt.month}).lean();
	//let QTAs = ppMonths.map(pp => pp.QTA_i)
	//let QTSs = ppMonths.map(pp => pp.QTS_i)
	let airCost= (ppMonth.QTA_i*distribution.UAir_Cost)

	let seaCost = (distribution.Cont_Cost*Math.ceil(ppMonth.QTS_i/distribution.Cont_Cap))
	let totalTranspCost = airCost+seaCost
	let TranspEm_AIR=(ppMonth.QTA_i*distribution.UAir_Em)
	let TranspEm_SEA=(distribution.Cont_Em*(Math.ceil(ppMonth.QTS_i/distribution.Cont_Cap)))
	let totalTranspEm = TranspEm_AIR+TranspEm_SEA

	return {
		Air_Cost: airCost,
		TranspEm_AIR: TranspEm_AIR,
		TranspEm_SEA: TranspEm_SEA,
		Sea_Cost: seaCost,
		TotalTranspCost: totalTranspCost,
		TotalTranspEm: totalTranspEm
	}
}

async function updateAllInvtW(opt){
	// loop all months and update Warehouse Production
	//let months = Model.periods.find({game: opt.game_id}).sort('index')
	let production = await Model.productions.findOne({game: opt.game_id})

	let playerProduction = await Model.playerProductions.findOne({month: opt.months[0]._id,team: opt.team})
	if(!playerProduction){
		return;
	}

	let ldata = {
		InvtWPE_i: production.InvtWPB_0-playerProduction.QTA_i-playerProduction.QTS_i,
		InvtWRE_i: production.InvtWRB_0+playerProduction.QTA_i-playerProduction.Sales,
		InvtWPB_i: production.InvtWPB_0,
		InvtWRB_i: production.InvtWRB_0+playerProduction.QTA_i
	}


	// playerProduction.InvtWPE_i = ldata.InvtWPE_i;
	// playerProduction.InvtWRE_i = ldata.InvtWRE_i
	// await playerProduction.save()
	await Object.assign(playerProduction, ldata).save()
	console.log("update invenory end of month ... ",playerProduction.InvtWRE_i)

	for (let i =1; i < opt.months.length; i++) {
		let lastPlayerProduction = await Model.playerProductions.findOne({month: opt.months[i]._id,team: opt.team})
		if(!lastPlayerProduction)
			break;
		let data = {
			Qt: playerProduction.Qt || 0,
			QTA_i: lastPlayerProduction.QTA_i || 0,
			QTS_i: playerProduction.QTS_i || 0,
			Sales: lastPlayerProduction.Sales || 0,
			Advertisement: lastPlayerProduction.Advertisement || 0
		}
		ppData = {
			InvtWPB_i: playerProduction.InvtWPE_i+data.Qt,//-data.QTA_i,
			InvtWPE_i: playerProduction.InvtWPE_i-data.QTA_i-lastPlayerProduction.QTS_i+data.Qt, //this.InvtWPB_i+Qt
			InvtWRB_i: playerProduction.InvtWRE_i+data.QTS_i+data.QTA_i,
			InvtWRE_i: playerProduction.InvtWRE_i+data.QTS_i+data.QTA_i-data.Sales, // add - sales here ...
			//Qt: data.Qt,
			//QTA_i: data.QTA_i,
			//QTS_i: data.QTS_i,
			Advertisement: data.Advertisement
		}
		await Object.assign(lastPlayerProduction, ppData).save()
		playerProduction = lastPlayerProduction;
	}
	console.log("UPDATE all inventories ...")


	await calculateProductionCost({production: production, months: opt.months, team: opt.team, game_id: opt.game_id})
}

async function updateSalesIndependentMarket(opt){
	console.log("CALCULATE DEMAND ON IDEPENDENT MARKET ... ");
	let advertisements = await Model.advertisements.find({game: opt.game_id})
	let saleModel = opt.sale;
	let PED = saleModel.PED;
	for (let i =0; i < opt.months.length; i++) {

		let team = opt.team;
		console.log("TEAM ... ."+team);
		//let playerProductions = await Model.playerProductions.find({team: team.name}).sort('created').lean();
		let lastPlayerProduction= i===0 ? {} : await Model.playerProductions.findOne({month: opt.months[i-1]._id,team: team});
	    let lastPlayerProductionPrice = i===0 ? saleModel.InitialPrice : lastPlayerProduction.Price;
	    // TODO update adv tab
	    let lastPlayerProductionAdv = i===0 ? 0 : (lastPlayerProduction.Advertisement||0);
	    let adValue = advertisements.find(ad => ad.option == lastPlayerProductionAdv);

	    let playerProduction = await Model.playerProductions.findOne({month: opt.months[i]._id,team: team});
	    if(!playerProduction){
	    	console.log("NO PLAYER PRODUCTION FOR TEAM "+team+" AND MONTH "+opt.months[i].name);
	    	break;
	    }
	    console.log(" RETURN IF NO PRICE ... ",playerProduction.Price);
	    //if(!playerProduction.Price)
	    //	break;

	    //console.log("PLAYER PRODUCTION ...... ",playerProduction)
	    let lastInvtWRE_i = i===0 ? playerProduction.InvtWRB_i : (lastPlayerProduction.InvtWRE_i+lastPlayerProduction.QTS_i);
	    let InvtWRB_i = lastInvtWRE_i+playerProduction.QTA_i; //Change to  playerProduction.InvtWRB_i
	   
	    let realDemand = calculateRealDemand_IM({month: opt.months[i], price: playerProduction.Price, lastPrice: lastPlayerProductionPrice, PED: (PED/100), Advertisement: (adValue ? (adValue.Yield_Impact/100) : 0)})
	    let sales = calculateSaleMonth({realDemand: realDemand, InvtWRB_i: InvtWRB_i})
	    let lostSales = Math.max(0,realDemand-InvtWRB_i);
	    let InvtWRE_i = InvtWRB_i-sales;


	    Object.assign(playerProduction, {
	            RealDemand: realDemand,
	            Sales: sales,
	            LostSales: lostSales,
	            //Advertisement: lastPlayerProductionAdv,
	            InvtWRE_i: InvtWRE_i,
	            InvtWRB_i: InvtWRB_i,
	            Revenu_i: playerProduction.Price*sales-adValue.Budget,
	    })
	    await playerProduction.save()
	    // console.log("PLAYER PRODUCTIONs ....... ",playerProductionUpdate);
	}
	
  // calculate retail warehouse cost and emission
  let optRw = {game_id: opt.game_id, team: opt.team, months: opt.months}
  await calculateRW_Cost_EM(optRw)
  console.log("FINISH UPDATE INDEPENDEDNT MARKET FOR THIS TEAM IN ALL MONTHS ....");  

}

async function updateSalesSharedMarket(opt){
	//let months = Model.periods.find({game: opt.game_id}).sort('index')
	let saleModel = await Model.sales.findOne({game: opt.game_id});
	let advertisements = await Model.advertisements.find({game: opt.game_id});
	let PED = saleModel.PED;
	for (let i =0; i < opt.months.length; i++) {
	  let allPlayerProductions = await Model.playerProductions.find({month: opt.months[i]._id}).sort('created').lean();
    let priceNotFoundIndex = allPlayerProductions.findIndex(pp =>  !pp.Price );

    if(priceNotFoundIndex !== -1){
    	console.log("PRICE not found for month .. "+i,opt.months[i].name)
    	break;
    }
    
		for(let team of opt.allTeams){
			//console.log("TEAM Shared Market ... ."+team);
			//let playerProductions = await Model.playerProductions.find({team: team.name}).sort('created').lean();
	    let playerProduction = await Model.playerProductions.findOne({month: opt.months[i]._id,team: team.name});
	    if(!playerProduction){
	    	console.log("NO PLAYER PRODUCTION FOR TEAM "+team+" AND MONTH "+opt.months[i].name);
	    	break;
	    }
	    let lastPlayerProduction= i===0 ? {} : await Model.playerProductions.findOne({month: opt.months[i-1]._id,team: team.name});
	    let lastInvtWRE_i = i===0 ? playerProduction.InvtWRB_i : (lastPlayerProduction.InvtWRE_i+lastPlayerProduction.QTS_i);
	    let InvtWRB_i = lastInvtWRE_i+playerProduction.QTA_i;

	    let advOption = playerProduction.Advertisement||0;
      	let adv = advertisements.find(ad => ad.option == advOption)
	    
	    let numTeams = opt.allTeams.length;
	    let avgPrice = allPlayerProductions.map(pp => pp.Price).reduce((prev,next) => {return prev+next})/numTeams;
		console.log("Avarge Price = ",avgPrice)
	    console.log("$  PLAYER PRODUCTION PRICE ... ",playerProduction.InvtWRB_i);
	    let realDemand = calculateRealDemand_SM({month: opt.months[i], price: playerProduction.Price, PED: (PED/100), Advertisement: (adv ? (adv.Yield_Impact/100) : 0),numTeams: numTeams, avgPrice: avgPrice})
	    let sales = calculateSaleMonth({realDemand: realDemand, InvtWRB_i: InvtWRB_i})
	    let lostSales = Math.max(0,realDemand-InvtWRB_i)
	    let InvtWRE_i = InvtWRB_i-sales;

	    console.log("NUM TEAM .... ",numTeams)
	    console.log("AVG PRICE .... ",avgPrice)
	    console.log("REAL DEMAND .... ",realDemand)
	    console.log("SALES .... ",sales)
	    console.log("LOST SALES .... ",lostSales)
	    console.log("INVENTORY RETAIL END MONTH .... ",InvtWRE_i)


	    let playerProductionUpdate = await Model.playerProductions.findOneAndUpdate({month: opt.months[i]._id,team: team.name},
	          {$set: {
	            RealDemand: realDemand,
	            Sales: sales,
	            LostSales: lostSales,
	            InvtWRE_i: InvtWRE_i,
	            InvtWRB_i: InvtWRB_i,
	            Revenu_i: sales*playerProduction.Price-adv.Budget
	          }},{upsert: true, new: true})

	    //console.log("PLAYER PRODUCTIONs ....... ",playerProductionUpdate);
	    let optRw = {game_id: opt.game_id, team: team.name, months: opt.months}
  		calculateRW_Cost_EM(optRw)
	  }
	}
	console.log("FINISH UPDATE SHARED MARKET FOR ALL TEAMS IN ALL MONTHS ....");  

}


async function recalculateInventory(opt){
	// when user add production quantity at month i
	// insert next months updated inventories
	let game = await Model.games.findOne({_id: opt.game_id})
	let allTeams = await Model.teams.find({game: opt.game_id});
	let opts=  { game_id: opt.game_id, team: opt.team, months: opt.months, allTeams: allTeams}
	let sale = await Model.sales.findOne({game: opt.game_id})

	await updateAllInvtW(opts)

	if(game.InventoryAffectSales){
		console.log("Inventory affect sales ... ",game.InventoryAffectSales)
		if(sale.MarketType == 'shared'){
			console.log("MarketType  ... ",sale.MarketType)
	      let allTeams = await Model.teams.find({game: req.params.game_id});

	      await updateSalesSharedMarket(opts)

	    }else{

	      opts=  { game_id: opt.game_id, months: opt.months, team: opt.team, sale: sale }

	      await updateSalesIndependentMarket(opts)  

	    }
	}

   let months = await Model.periods.find({game: opt.game_id}) 
   for(let month of months){
        await calculateProductionCost_ForMonth({game_id: opt.game_id,team: opt.team,month: month._id})
        await calculateEmissionWP_ForMonth({game_id: opt.game_id,team: opt.team,month: month._id})
        await calculateRW_Cost_EM_ForMonth({game_id: opt.game_id,team: opt.team,month: month._id})
                
      } 
	//await updateSalesSharedMarket(opts)

	// when user add shipping by air 
	// when user add shipping by sea
	// recalculate shared market data
}

module.exports = {
	compareMonth: compareMonth,
	calculateRealDemand_SM: calculateRealDemand_SM,
	calculateSaleMonth: calculateSaleMonth,
	initInvtW: initInvtW,
	recalculateInventory: recalculateInventory,
	updateAllInvtW: updateAllInvtW,
	updateSalesSharedMarket: updateSalesSharedMarket,
	updateSalesIndependentMarket: updateSalesIndependentMarket,
	calculateEmissionWP: calculateEmissionWP,
	calculateRW_Cost_EM: calculateRW_Cost_EM,
	calculateProductionCost_ForMonth: calculateProductionCost_ForMonth,
	calculateEmissionWP_ForMonth: calculateEmissionWP_ForMonth,
	calculateRW_Cost_EM_ForMonth: calculateRW_Cost_EM_ForMonth


}
