var express=require('express');
var mysql = require('mysql');
var app = express();
var bodyParser = require('body-parser');
var cors = require('cors');
var credentials=require('./credentials.js');
//var session=require('express-session');
var pool=require('./mysqlpool.js');

app.set('port',process.env.PORT || 3000);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.use(cors());
/*app.use(require('cookie-parser')(credentials.cookieSecret));
app.use(require('express-session')());*/
/*app.use(session({
  name:'sid',
  resave:false,
  saveUninitialized:false,
  secret:'racecar',
   cookie:{
     maxAge:1000*60*60,
     sameSite:true
   }
}));*/
//var users={userid:'',usernme:'',tokenid:''};
app.post('/userwelcome',function(req,res){
  var usr=req.body.username;
  var phonenum=req.body.phonenum;
  var address=req.body.address;
  var city=req.body.city;
  var state=req.body.state;
  var email=req.body.email;
  var data={username:usr};
  console.log(data.username);
  pool.getConnection(function(err,con){
    if(err) throw err;
    var sql="insert into user_info(username,phonenum,address,city,state,email,status)values(?,?,?,?,?,?,?)";
    con.query(sql,[usr,phonenum,address,city,state,email,'REQUESTED'],function(err,result){
      if(err) throw err;
      console.log('1 row inserted');
      //var data={username:usr};
    //  console.log(data);
      res.json({status:'SUCCESS',message:'succesfully registered!',data:data});
    });
    con.release();
  });
});
app.post('/enquirysubmit',function(req,res){
  var username=req.body.username;
  var roomdetails=req.body.roomdetails;
//  var totswitch_boards=roomdetails.switches.length;
  var sql='';
  var customerid=-1;
  var values=[];
  console.log(username);
  //console.log(totswitch_boards);
  console.log(roomdetails);
  pool.getConnection(function(err,con){
    if(err)throw err;
    var sql="select custid from user_info where username=?";
    con.query(sql,[username],function(err,result){
     customerid=result[0].custid;
      console.log(customerid);
     //var sql1="insert into enquiry(cust_id,room_name,board_id,device_name,power,two_way,inverter_connection,nuetral_check,last_updated_by) values ?";
     var sql1="";
      for(var row of roomdetails){
        for(var iter of row.switches){
          for(var i=0;i<iter.no_devices;i++){
            //  sql="insert into enquiry(cust_id,room_name,board_id,device_name,power,two_way,inverter_connection,nuetral_check,last_updated_by) values ?"+";";
              sql1+="insert into enquiry (cust_id,room_name,board_id,device_name,power,two_way,device_wire,inverter_connection,nuetral_check,last_updated_by) values (?,?,?,?,?,?,?,?,?,?); "
              values.push(customerid);
              values.push(row.roomname);
              values.push(iter.switch_id);
              values.push('newdevice');
              values.push(0);
              values.push(0);
              values.push(0);
              values.push(0);
              values.push('no');
              values.push('CUSTOMER-'+customerid);
            //  values.push(0);
             /*con.query(sql,[customerid,roomdetails.roomname,roomdetails.switch_id,'newdevice',0.0,0,0,no,customerid],function(err,result){
                if(err) throw err;
                console.log('rows inserted');
                res.json({status:'SUCCESS',message:'enquiry submitted !!'});
              });*/

          }
        }
      }
      console.log(values, values.length);
      console.log(sql1);
      con.query(sql1, values,function(err,result){
        if (err) throw err;
        console.log('rows inserted');
        res.json({status:'SUCCESS',message:'enquiry submitted!!'});
      });
    });

  //  sql1="insert into enquiry(cust_id,room_name,board_id,device_name,power,two_way,inverter_connection,nuetral_check,last_updated_by) values ?"

    con.release();
  });
});
app.post('/initlogin',function(req,res){
 //  var tokenid=req.body.headers;
 var tokenid=req.headers['authorization'];

  /*var user=this.users.find((user)=>{
    user.tokenid===fetched_token
  });
  if(user){
    res.json({status:'logged_user'});
  }
  else{
    res.json({status:'no_logged_user'});
  }*/
  pool.getConnection(function(err,con){
    if(err)throw err;
    console.log('connected');
    var sql="select * from keep_loggedIn WHERE token=? ";
    con.query(sql,[tokenid],function(err,result){
      if(err) throw err;
      if(result.length<1){
        res.json({status:'no_logged_user'});
      }
      else
        {
          res.json({status:'logged_user'});
        }
        con.release();
    });

  })
});
app.post('/loggingout',function(req,res){
  var username=req.body.user;
  console.log(username);
  pool.getConnection(function(err,con){
    if(err) throw err;
    console.log('loggingout connected');
    var sql="delete from keep_loggedIn where username=?";
    con.query(sql,[username],function(err, result){
      if(err)throw err;
      if(result.affectedRows>0){
        console.log('token deleted');
        res.json({status:'SUCCESS'});
      }else{
        res.json({status:'FAILED'});
      }
    });
    con.release();
  });
})

function getToken(){
  return (Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)).toString();
};

app.post('/login',function(req,res){
            //const{userId}=req.session;
            var usr=req.body.username;
            console.log(usr);
            var pwd=req.body.password;
          /*  if(usr&&pwd){
            var user=this.users.find((user)=>{
              user.usernme===usr&&user.password
            });*/

        /*  if(user){
            req.session.userId=user.userid;
          }
          else{
            users.userid=(users.length)+1;
            users.usernme=usr;
          /*  var con = mysql.createConnection({
                         host:'127.0.0.1',
                         user:'webapp',
                         password:'pswdapp',
                         database:'homeautomation',
            });*/
            pool.getConnection(function(err,con){
              if(err)throw err;
              console.log('connected');
              var sql="select * from admin_info WHERE admin_name=? AND password= ? ";
              con.query(sql,[usr,pwd],function(err,result){
                if(err) throw err;
                if(result.length<1){
                  res.json({status:'invalid credentials'});
                }
                else
                  {
                    var token_value= getToken();
                    console.log(token_value);
                    var data={username:usr,token:token_value};
                  //  this.users.tokenid=data.token;
                    var sql1="INSERT INTO keep_loggedIn (token,username) VALUES (?,?) ";
                    con.query(sql1,[data.token,usr],function(err,result){
                      if(err) throw err;
                      console.log('inserted token succesfully');
                    })
                    //con.release();
                    res.json({status:'SUCCESS', data: data});
                  }
                  con.release();
              });

            })
        /*   con.connect(function(err){
             if(err) throw err;
             console.log("connected");
             var sql="select * from admin_info WHERE admin_name=? AND password= ? ";
             con.query(sql,[usr,pwd],function(err,result){
               if(err) throw err;
               if(result.length<1){
                 res.json({status:'invalid credentials'});
               }
               else {
                 {
                   var data={username:usr,token:()=>{Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);}};
                   this.users.tokenid=data.token;
                   res.json({status:'SUCCESS', data: data});
                 }
               }
             });

           });*/

});
app.post('/register',function(req,res){
      var usr=req.body.username;
      console.log(usr);
      var pwd=req.body.password;
      console.log(pwd);
      var phone=req.body.phone;
      console.log(phone);
      var email=req.body.email;
    //  users.userid=usr;
    //  users.password=pwd;
    //  users.usernme=(users.length)+1;
      var con = mysql.createConnection({
                   host:'127.0.0.1',
                   user:'webapp',
                   password:'pswdapp',
                   database:'homeautomation',
      });

      con.connect(function(err){
        if(err)throw err;
        console.log('connected');
        var sql="select * from admin_info where admin_name=? ";
        con.query(sql,[usr],function(err,result){
             if(err)throw err;
             if(result.length>0){
               res.json({status:'NOTSUCCESS',message:'user already exist!'});
             }else{
               var sql= "INSERT INTO admin_info (admin_name,password,email,phonenum) VALUES (?,?,?,?)";
               con.query(sql,[usr,pwd,email,phone],function(err,result){
                 if(err)throw err;
                 console.log('1 row inserted');
                 res.json({status:'SUCCESS',message:'succesfully registered!'});
               });
             }
        });
      });
});
app.get('/viewProfiles',function(req,res){
  var con = mysql.createConnection({
               host:'127.0.0.1',
               user:'webapp',
               password:'pswdapp',
               database:'homeautomation',
  });
  con.connect(function(err){
    if(err) throw err;
    var sql="select custid,username,email,phonenum from user_info";
    con.query(sql,function(err,result){
      if(err)throw err;
      console.log('rows fetched!!');
      res.json(result);
    });
  });
});
app.get('/viewsurvey/:custid',function(req,res){
  var customerid=req.params.custid;
  var con = mysql.createConnection({
               host:'127.0.0.1',
               user:'webapp',
               password:'pswdapp',
               database:'homeautomation',
  });
  con.connect(function(err){
    if(err)throw err;
    var sql="select enquiry_id, room_name,board_id, device_name, last_updated_by, created_on,two_way,power,inverter_connection,nuetral_check from enquiry where cust_id=?";
    con.query(sql,[customerid],function(err,result){
      if(err)throw err;
      console.log('rows fetched');
      console.log(result);
      res.json(result);

    });
  });
});
function convert(val){
  if(val==true) return 1;
  else if(val==false||val==null) return 0;
}
app.post('/submitsurvey',function(req,res){
  var surverarr=[];
  surveyarr=req.body.survey;
  console.log(surveyarr);
  console.log(surveyarr[0].boards[0].devices);
  var con = mysql.createConnection({
               multipleStatements: true,//shold be added for excecuting multiple sql statements with single con.query()
               host:'127.0.0.1',
               user:'webapp',
               password:'pswdapp',
               database:'homeautomation',
  });
  con.connect(function(err){
    if(err)throw err;
    var sql='';
  /*  for(var row in surveyarr){
      var survey = surveyarr[row];//was added to remove error,forgot to add where clause in update statement
      sql += "UPDATE enquiry SET two_way="+con.escape(survey.two_way)+", power="+con.escape(survey.power)+",inverter_connection="+con.escape(survey.inverter_connection)+" WHERE enquiry_id="+con.escape(survey.enquiry_id)+";";
    /*  sql="UPDATE enquiry SET power=?,two_way=?,inverter_connection=?"
      con.query(sql,[row.power,row.two_way,row.inverter_connection],function(err,result){
        if(err)throw err;
        if(result.affectedRows>0){
          res.json({status:'SUCCESS',message:'updation succesful'})
        }
        else{
          res.json({status:'UNSUCCESS',message:'updation unsuccesful'});
        }*/
      //} */
      for(var iter of surveyarr){
        for(var rep of iter.boards){
          for(var dev of rep.devices){
            console.log("convert function",convert(dev.two_way));
          sql += "UPDATE enquiry SET room_name="+con.escape(dev.device_name)+",two_way="+con.escape(convert(dev.two_way))+",device_wire="+con.escape(convert(dev.device_wire))+", power="+con.escape(dev.power)+",inverter_connection="+con.escape(convert(dev.inverter_connection))+" ,nuetral_check="+con.escape(convert(rep.nuetral_check))+" WHERE enquiry_id="+con.escape(dev.enquiry_id)+";";
        }
      }
      }
      console.log(sql);
    con.query(sql, function(err,result){
      if(err)throw err;
      res.json({status:'SUCCESS',message:'updation succesful'})
    });
  });

});
app.listen(3000,function(){
  console.log("Started on PORT 3000");
});
