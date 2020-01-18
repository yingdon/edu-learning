import express from 'express'
import config from './config.js'
import nunjucks from 'nunjucks'
import indexRouter from './routes/index.js'
import advertRouter from './routes/advert.js'
import queryString from 'querystring'
import bodyParser from './middlewares/body_parser.js'
import errorLog from './middlewares/error_log.js'

const app = express()

// 静态资源
app.use('/node_modules', express.static(config.node_modules_path))
app.use('/public', express.static(config.publicPath))

// 配置使用nunjucks模板引擎
nunjucks.configure(config.viewPath, {
	autoescape: true,
	express: app,
	/**
	 *  nunjucks模板引擎默认会缓存输出过的文件
	 * 	这里为了开发方便,所以把缓存禁用掉,可以实时的看到模板文件修改的变化
	 */
	noCache: true
})

// 挂载 解析处理表单POST请求体中间件
app.use(bodyParser)

// 挂载路由
app.use(indexRouter)
app.use(advertRouter)

// 处理错误
app.use(errorLog)

app.listen(8080, () => {
	console.log('running...')
})
