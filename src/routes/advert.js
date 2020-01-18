import express from 'express'
import Advert from '../models/advert.js'
import formidable from 'formidable'
import config from '../config.js'
import { basename } from 'path'

const router = express.Router()

// 服务端分页
/* router.get('/advert', (req, res, next) => {
	let page = Number.parseInt(req.query.page, 10)
	const paseSize = 5
	
	Advert
		.find()
		.skip((page - 1) * paseSize)
		.limit(paseSize)
		.exec((err, adverts) => {
			if (err) {
				return next(err)
			}
			Advert.countDocuments((err, count) => {
				if (err) {
					return next(err)
				}
				// 总页码
				let totalPage = Math.ceil(count / paseSize)
				res.render('advert_list.html', { adverts, totalPage, page })
			})
		})
}) */

// 客户端异步无刷新分页
router.get('/advert/count', (req, res, next) => {
	Advert.countDocuments((err, count) => {
		if (err) {
			return next(err)
		}
		res.json({
			err_code: 0,
			result: count
		})
	})
})

router.get('/advert', (req, res, next) => {
	res.render('advert_list.html')
})

router.get('/advert/add', (req, res, next) => {
	res.render('advert_add.html')
})

router.post('/advert/add', (req, res, next) => {
	pmFormidable(req)
		.then( result => {
			const { fields, files } = result
			const body = fields		// 普通表单字段
			body.image = basename(files.image.path)		// 这里解析提取上传的文件名,保存到数据库
					
			const advert = new Advert({
				title:	body.title,
				image:	body.image,
				link:	body.link,
				start_time:	body.start_time,
				end_time:	body.end_time,
			})
			// mongoose已经支持promise,这里save()返回的是一个promise对象,所以下面直接.then
			return advert.save()
		})
		.then(result => {
			res.json({
				err_code: 0
			})
		})
		.catch(err => {
			next(err)
		})
		
	function pmFormidable(req) {
		return new Promise((resolve, reject) => {
			const form = new formidable.IncomingForm();
			form.uploadDir = config.uploadDir		// 配置formidable文件上传接收路径
			form.keepExtensions = true					// 配置保持文件原始的扩展名
			
			// fields 是接收到的表单中的普通数据字段
			// files 是表单中文件上传上来的一些文件信息,例如文件大小,上传上来的文件路径等
			form.parse(req, (err, fields, files) => {
				if (err) {
					reject(err)
				}
				// promise对象不能返回多个值,所以这里放在对象或数组里
				resolve({ fields, files })
			})
		})
	}
})

router.get('/advert/list', (req, res, next) => {
	let { page, pageSize } = req.query	// 解构赋值
	page = Number.parseInt(page)
	pageSize = Number.parseInt(pageSize)
	
	Advert
		.find()
		.skip((page - 1) * pageSize)
		.limit(pageSize)
		.exec((err, adverts) => {
			if (err) {
				return next(err)
			}
			res.json({
				err_code: 0,
				result: adverts
			})
		})
})

/**
 * 	/advert/show/:advertId 是一个模糊匹配路径
 * 	可以匹配 /advert/show/* 的路径形式
 * 	但是 /advert/show 或者 /advert/show/a/b 这样的不行
 * 	至于advertId是自己起的名字,可以在处理函数中通过req.params来进行获取
 */
router.get('/advert/show/:advertId', (req, res, next) => {
	Advert.findById(req.params.advertId, (err, result) => {
		if (err) {
			return next(err)
		}
		res.json({
			err_code: 0,
			result: result
		})
	})
})

router.post('/advert/edit', (req, res, next) => {
	// const body = req.body
	Advert.findById(body.id, (err, advert) => {
		if (err) {
			return next(err)
		}
		advert.title = body.title
		advert.image = body.image
		advert.link = body.link
		advert.start_time = body.start_time
		advert.end_time = body.end_time,
		advert.last_modified = Date.now()
		
		// 这里的save,因为数据库该条数据内部有一个_id,所以这里是不会新增数据的,而是更新已有的数据
		advert.save((err, result) => {
			if (err) {
				return next(err)
			}
			res.json({
				err_code: 0
			})
		})
	})
})

router.get('/advert/remove/:advertId', (req, res, next) => {
	Advert.remove({ _id: req.params.advertId }, err => {
		if (err) {
			return next(err)
		}
		res.json({
			err_code: 0
		})
	})
})

export default router