import mongodb from 'mongodb'

const MongoClient = mongodb.MongoClient
const url = 'mongodb://localhost:27017/edu'

export default (errLog, req, res, next) => {
	// 1.将错误日志纪录到数据库,方便排查
	// 2.发送响应给客户,给一些友好的提示信息
	// { 错误名称, 错误信息, 错误堆栈, 错误发生时间 }
	MongoClient.connect(url, (err, client) => {
		// 3.x版的mongodb模块提供的api必须这么写
		// //client参数似乎是连接成功之后的mongoclient
		const db = client.db('edu')
		db
			.collection('error_logs')
			.insertOne({
				name: errLog.name,
				message: errLog.message,
				stack: errLog.stack,
				time: new Date()
			}, (err, result) => {
				res.json({
					err_code: 500,
					message: errLog.message
				})
			})
		client.close()
	})
}