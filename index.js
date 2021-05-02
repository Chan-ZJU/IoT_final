var express = require("express")
var mysql = require("mysql")
var bodyParser = require("body-parser")
var app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.listen(3389,function(){
    console.log("The server is running at port 3389")
})

function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "y+": date.getFullYear().toString(),        // 年
        "M+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "h+": date.getHours().toString(),           // 时
        "m+": date.getMinutes().toString(),         // 分
        "s+": date.getSeconds().toString()          // 秒
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}

app.all("*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS")
    res.header("Access-Control-Allow-Headers", "X-Requested-With")
    res.header("Access-Control-Allow-Headers", "Content-Type")
    res.header("Access-Control-Allow-Credentials", "true")
    next()
})

app.use("/interface",express.static('dist'))

app.post("/device/getalive",function(req,res){
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'mhy',
        password: '091625',
        database: 'IOT_Device'
    })
    var id = req.body.id
    var instruction = "SELECT alive FROM device WHERE id = ?"
    var params = [id]
    connection.connect()
    connection.query(instruction,params,function(err,result){
        if(err){
            console.log("-------ERROR!-------")
            console.log(err.message)
            res.send({code: 444})
            res.end()
        }
        else{
            var originTime = new Date(result[0].alive)
            var aliveTime = dateFormat("yyyy-MM-dd hh:mm:ss",originTime)
            res.send(aliveTime)
            res.end()
        }
    })
    connection.end()
})

app.get("/device/addinfo",function(req,res){
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'mhy',
        password: '091625',
        database: 'IOT_Data'
    })
    var id = req.query.id
    var fall = req.query.fall
    var gps = req.query.gps
    var instruction = "INSERT INTO data" + id + " (fall,gps) VALUES(?,?)"
    var params = [fall,gps]
    connection.connect()
    connection.query(instruction,params,function(err,result){
        if(err){
            console.log("-------ERROR!-------")
            console.log(err.message)
        }
    })
    connection.end()
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'mhy',
        password: '091625',
        database: 'IOT_Device'
    })
    var instruction1 = "UPDATE device SET fall=?, gps=?, alive=default WHERE id = " + id
    var instruction2 = "SELECT light, sound FROM device WHERE id = " + id
    connection.connect()
    connection.query(instruction1,params,function(err,result){
        if(err){
            console.log("-------ERROR!-------")
            console.log(err.message)
        }
    })
    connection.query(instruction2,function(err,result){
        if(err){
            console.log("-------ERROR!-------")
            console.log(err.message)
            res.send({code: 444})
            res.end()
        }
        else{
            var downData = [result[0].light, result[0].sound]
            res.send(downData)
            res.end()
        }
    })
    connection.end()
})

app.post("/device/getnum",function(req,res){
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'mhy',
        password: '091625',
        database: 'IOT_Device'
    })
    var instruction = "SELECT id FROM device"
    connection.connect()
    connection.query(instruction,function(err,result){
        if(err){
            console.log("-------ERROR!-------")
            console.log(err.message)
            res.send({code: 444})
            res.end()
        }
        else{
            var idSets = []
            for(i = 0, len = result.length; i < len; i++){
                idSets.push(result[i].id)
            }
            res.send(idSets)
            res.end()
        }
    })
    connection.end()
})

app.post("/device/getstatus",function(req,res){
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'mhy',
        password: '091625',
        database: 'IOT_Device'
    })
    var id = req.body.id
    var instruction = "SELECT * FROM device WHERE id = " + id
    connection.connect()
    connection.query(instruction,function(err,result){
        if(err){
            console.log("-------ERROR!-------")
            console.log(err.message)
            res.send({code: 444})
            res.end()
        }
        else{
            var status = {fall:result[0].fall, gps:result[0].gps.split(',').map(Number), light:result[0].light, sound:result[0].sound}
            res.send(status)
            res.end()
        }
    })
    connection.end()
})

app.post("/device/alarmon",function(req,res){
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'mhy',
        password: '091625',
        database: 'IOT_Device'
    })
    var id = req.body.id
    var instruction = "UPDATE device SET light=1, sound=1 WHERE id = " + id
    connection.connect()
    connection.query(instruction,function(err,result){
        if(err){
            console.log("-------ERROR!-------")
            console.log(err.message)
            res.send({code: 444})
            res.end()
        }
        else{
            res.send({code: 200})
            res.end()
        }
    })
    connection.end()
})

app.post("/device/alarmoff",function(req,res){
    var connection = mysql.createConnection({
        host: 'localhost',
        user: 'mhy',
        password: '091625',
        database: 'IOT_Device'
    })
    var id = req.body.id
    var instruction = "UPDATE device SET light=0, sound=0 WHERE id = " + id
    connection.connect()
    connection.query(instruction,function(err,result){
        if(err){
            console.log("-------ERROR!-------")
            console.log(err.message)
            res.send({code: 444})
            res.end()
        }
        else{
            res.send({code: 200})
            res.end()
        }
    })
    connection.end()
})