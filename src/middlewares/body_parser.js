import queryString from 'querystring'

export default (req, res, next) => {
	// req.headers可以拿到当前请求的请求头部信息
	// get请求的头部信息没有 content-length, 这里也可以用req.method.toLowerCase() === 'get'来做判断
	if (req.method.toLowerCase() === 'get') {
		return next()
	}
	/**
	 * 	由于表单POST请求可能会携带大量的数据,所以在进行请求提交的时候会分为多次提交
	 * 	具体分为多少次进行提交不一定,取决于数据量的大小
	 * 	在Node中,对于处理这种不确定的数据,使用事件的形式处理
	 * 	这里可以通过监听req对象的data事件,然后通过对应的回调处理函数中的参数chunk拿到每一次接收到的数据
	 * 		data事件触发多少次,不一定
	 * 	当数据接收完毕之后,会自动触发req对象的end事件,然后就可以在end事件中使用接收到的表单POST请求体
	 */
	// 如果是普通表单,则在这里处理;如果是有文件的表单,不处理
	if ( req.headers['content-type'].startsWith('multipart/form-data') ){
		return next()
	}
	
	let data = ''
	req.on('data', chunk => {
		data += chunk
	})
	req.on('end', () => {
		// 手动给req对象挂载一个body属性,值就是当前表单POST请求体对象
		// 在后续的处理中间件中,就可以直接使用req.body中
		// 因为在同一个请求中,流通的都是同一个req和res对象
		req.body = queryString.parse(data)
		next()
	})
}