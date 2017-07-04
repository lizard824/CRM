var http = require("http"),
	url = require("url"),
	mime = require("mime"),
	fs = require("fs");

var server1 = http.createServer(function(req, res) {
	var urlObj = url.parse(req.url, true),
		pathname = urlObj.pathname,
		query = urlObj.query; // ulr(?xxx=xxxx)

	//static resourse
	var reg = /\.(HTML|CSS|JS|ICO)/i;
	if (reg.test(pathname)) {
		var suffix = reg.exec(pathname)[1].toUpperCase();
		var suffixMIME = "text/html";
		switch (suffix) {
			case "CSS":
				suffixMIME = "text/css";
				break;
			case "JS":
				suffixMIME = "text/javascript";
				break;
		}
		try {
			var conFile = fs.readFileSync("." + pathname, "UTF-8");
			res.writeHead(200, {
				'content-type': suffixMIME + ';charset=utf-8;'
			})
			res.end(conFile);
		} catch (e) {
			// statements
			res.writeHead(404, {
				'content-type': 'text/plain;charset=utf-8;'
			})
			res.end("file is not found.");
			console.log(e);
		}
		return;
	}
	var con = null,
		result = null,
		customId = null,
		customPath = "./json/custom.json";
	//get content from file
	con = fs.readFileSync(customPath, "utf-8");
	con.length === 0 ? con = '[]' : null; //为了防止文件中什么都没有 会报错
	con = JSON.parse(con);
	//1 getList
	if (pathname === "/getList") {

		result = {
			code: 1,
			msg: "No any result!",
			data: null
		};
		if (con.length > 0) {
			result = {
				code: 0,
				msg: "success",
				data: con
			}
		};
		res.writeHead(200, {
			'content-type': 'application/json;chareset-utf-8;'
		})
		res.end(JSON.stringify(result));
		return;
	}
	//2 getInfo
	if (pathname === "/getInfo") {
		customId = query["id"];
		console.log(customId);
		result = {
			code: 1,
			msg: "No this custom",
			data: null
		};
		for (var i = 0; i < con.length; i++) {
			if (con[i]["id"] == customId) {

				result = {
					code: 0,
					msg: "success",
					data: con[i]
				};
				break;
			}
		}
		res.writeHead(200, {
			'content-type': 'application/json;chareset-utf-8;'
		})
		res.end(JSON.stringify(result));
		return;

	}
	//3 delete Customer
	if (pathname === "/removeInfo") {
		customId = query["id"];
		var flag = false;
		for (var i = 0; i < con.length; i++) {
			if (con[i]["id"] == customId) {
				con.splice(i, 1);
				flag = true;
				break;
			}
		}
		result = {
			code: 1,
			msg: "delete failed"
		}
		if (flag) {
			fs.writeFileSync(customPath, JSON.stringify(con), "utf-8");
			result = {
				code: 0,
				msg: "delete success."
			};
		}
		res.writeHead(200, {
			'content-type': 'application/json;chareset-utf-8;'
		})
		res.end(JSON.stringify(result));
		return;
	}
	//4 add customer
	if (pathname === "/addInfo") {
		//客户端请求传经来的内容
		var str = '';
		req.on("data", function(chunk) {
			str += chunk;

		});
		req.on("end", function() {
			if (str.length === 0) {
				res.writeHead(200, {
					'content-type': 'application/json;chareset-utf-8;'
				})
				res.end(JSON.stringify({
					code: 1,
					msg: "add customer failed."
				}));

			}
			var data = JSON.parse(str);
			data["id"] = con.length === 0 ? 1 : parseFloat(con[con.length - 1]["id"]) + 1;
			con.push(data);
		res.writeHead(200, {
			'content-type': 'application/json;chareset-utf-8;'
		})
		res.end(JSON.stringify({
			code:0,
			msg:"add customer successful"
		}));

		});
		return;

	}
	//5 modify customer
	if (pathname === "/updateInfo") {
		str = '';
		req.on("data", function(chunk) {
			str += chunk;
		});
		req.on("end", function() {
			if (str.length === 0) {
				res.writeHead(200, {
					'content-type': 'application/json;chareset-utf-8;'
				})
				res.end(JSON.stringify({
					code: 1,
					msg: "modify customer failed."
				}));
				return;
			}
			var flag = false;
			data = JSON.parse(str);
			for (var i = 0; i < con.length; i++) {
				if (con[i]["id"] == data["id"]) {
					con[i] = data;
					flag = true
					break;
				}
			}
			result.msg = "modify failed";
			if (flag) {
				fs.writeFileSync(customPath, Json.stringify(con), "utf-8");
				result = {
					code: 0,
					msg: "modify successfulc"
				}
			}
			res.writeHead(200, {
				'content-type': 'application/json;chareset-utf-8;'
			})
			res.end(JSON.stringify(result));

		});
		return;
	}

});


server1.listen(81, function() {
	console.log("server is listened by 81 port");
});