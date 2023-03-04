const mongoose = require('mongoose')
const mongoDB = process.env.MONGO_URL_EDUGAME

mongoose.connect(mongoDB,  {
	useUnifiedTopology: true,
	useNewUrlParser: true
	});
mongoose.Promise = global.Promise;

const db = mongoose.connection;
const Schema = mongoose.Schema;
mongoose.set('useFindAndModify', false)


const gameSchema = Schema({
	name: String,
	user: {
		email: String,
		name: String,
		user_id: String
	},
	status: {type: String, default: 'stopped'},
	currentMonth: {type: Number, default: 0},
	currentStage: {type: Number, default: 0},
	interval: {type: Number, default: 300},
	InitialBudget: Number,
	carbon_policy: Schema.Types.Mixed,
	investment_options:  Schema.Types.Mixed,
	InventoryAffectSales: {type: Boolean, default: false}
})

const games = mongoose.model('Game', gameSchema)


const productionSchema = Schema({
	Prod_Cap: Number,
	LeadProd: Number,
	VarProd: Number,
	UProd_Cost: Number,
	UProd_Em: Number,
	InvtWPB_0: Number,
	InvtWRB_0: {type: Number, default: 0},
	WP_Cap: Number,
	UHoldWP_Cost: Number,
	UHoldWP_Em: Number,
	game: { type: Schema.Types.ObjectId, ref: 'Game' }
})

const productions = mongoose.model('Production', productionSchema)

const distributionSchema = Schema({
	UAir_Cost: Number,
	UAir_Em: Number,
	Cont_Cost: Number,
	Cont_Cap: Number,
	Cont_Em: Number,
	game: { type: Schema.Types.ObjectId, ref: 'Game' }
})

const distributions = mongoose.model('Distribution', distributionSchema)

const salesSchema = Schema({
	WR_Cap: Number,
	UHoldWR_Cost: Number,
	UHoldWR_Em: Number,
	InitialDemand: {type: Number, default: 0},
	InitialPrice: {type: Number, default: 0},
	PED: Number,
	DeltaPrice: Number,
	MarketType: {type: String, default: 'shared'},
	DemandType: {type: String, default: 'deterministic'},
	game: { type: Schema.Types.ObjectId, ref: 'Game' }
})

const sales = mongoose.model('Sale', salesSchema)

const periodSchema = Schema({
	index: Number,
	name: String,
	label: String,
	start: String,
	end: String,
	demand: Number,
	demandHistory: Number,
	game: { type: Schema.Types.ObjectId, ref: 'Game' }
})
const periods = mongoose.model('Period', periodSchema)

const playerProductionSchema = Schema({
	month: { type: Schema.Types.ObjectId, ref: 'Period' },
	team_value: { type: Schema.Types.ObjectId, ref: 'TeamValue' },
	Qt: {type: Number, defaut: 0},
	Qt_Plan: {type: Number, defaut: 0},
	InvtWPB_i: Number,
	InvtWPE_i: Number,	
	QTA_i: {type: Number, defaut: 0},
	QTS_i: {type: Number, defaut: 0},
	QTA_i_Plan: {type: Number, defaut: 0},
	QTS_i_Plan: {type: Number, defaut: 0},
	InvtWRB_i: Number,
	InvtWRE_i: Number,	
	InvtWPB_i_Plan: Number,
	InvtWPE_i_Plan: Number,
	InvtWRB_i_Plan: Number,
	InvtWRE_i_Plan: Number,
	Price: Number,
	Revenu_i: Number,
	ExpectedDemand: Number,
	RealDemand: Number,
	Sales: Number,
	LostSales: Number,
	Advertisement: {type: Number, default: 0},
	team: String,
	CvProd: Number,
	TotalProdCost: Number,
	TotalProdEm: Number,
	TotalTranspCost: Number,
	TotalTranspEm: Number,
	InvtWR_HoldingCost:Number,
	InvtWP_HoldingCost:Number,
	InvtWR_EmLevel: Number,
	InvtWP_EmLevel: Number,
	TranspEm_AIR: Number,
	TranspEm_SEA: Number,
	ProdCost: Number,
	HoldCost: Number,
	Air_Cost:Number,
	Sea_Cost: Number,
	created: {type: Date, defaut: Date.now()} 
})

const playerProductions = mongoose.model('PlayerProduction', playerProductionSchema)

const teamValueSchema = Schema({
	CvProd: Number,
	TotalProdCost: Number,
	TotalProdEm: Number,
	TotalTranspCost: Number,
	TotalTranspEm: Number,
	InvtWR_HoldingCost:Number,
	InvtWR_EmLevel: Number,
	A_P_Month: Number, // invest decision by GM for the month index
	A_IWP_Month: Number,
	A_IWR_Month: Number,
	team: String,
	game: { type: Schema.Types.ObjectId, ref: 'Game' }

})
const teamValues = mongoose.model('TeamValue', teamValueSchema)

const advertisementSchema = Schema({
	option: Number,
	Yield_Impact: Number,
	Budget: Number,
	Comment: String,
	game: { type: Schema.Types.ObjectId, ref: 'Game' }
})

const advertisements = mongoose.model('Advertisement',advertisementSchema)

const teamSchema = Schema({
	name: String,
	description: String,
	game: { type: Schema.Types.ObjectId, ref: 'Game' },
	players: Schema.Types.Mixed,
	created: {type: Date, defaut: Date.now()} 
})

const teams = mongoose.model('Team', teamSchema)


module.exports = {
	games: games,
	productions: productions,
	distributions: distributions,
	sales: sales,
	periods: periods,
	playerProductions: playerProductions,
	teams: teams,
	teamValues: teamValues,
	advertisements: advertisements,
	mongo: mongoose.mongo
}