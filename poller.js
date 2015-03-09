var config = require('./config.js');
var fs = require('fs');
var generalSQL = require('./sql/generalSQL.js');
var influx = require('influx');

var oracledb = require('oracledb');

var stepNumber = 0;

setInterval(function() {
  stepNumber++;

  if (stepNumber > 100000) {
    stepNumber = 0;
  }

  config.dblists.forEach(function(db) {

      console.log((new Date()) + ' : [' + db.dbname + ' ' + stepNumber + '] Start to query data');

      // Count real-time sessions
      getData(db, generalSQL.sessions, function(results){
        console.log((new Date()) + ' : [' + db.dbname + ' ' + stepNumber + '] Result return sessions');

        //console.log(results);

        if (config.csv) {
          csvSave(results,'oracle_sessions', db.dbid, db.dbname, function(err,result){ if(err) {console.log(err);}});
        }

        if (config.influx) {
          saveData(results,'oracle_sessions', db.dbid, db.dbname, function(err){ if(err) {console.log(err);}});
        }
      });

      // Get Tablespaces usaged
      getData(db, generalSQL.tablespaces, function(results){
        console.log((new Date()) + ' : [' + db.dbname + ' ' + stepNumber + '] Result return tablespaces');

        //console.log(results);

        if (config.csv) {
          csvSave(results,'oracle_tablespaces', db.dbid, db.dbname, function(err,result){ if(err) {console.log(err);}});
        }

        if (config.influx) {
          saveData(results,'oracle_tablespaces', db.dbid, db.dbname, function(err){ if(err) {console.log(err);}});
        }
      });

      // Get System waited events
      getData(db, generalSQL.waits, function(results){
        console.log((new Date()) + ' : [' + db.dbname + ' ' + stepNumber + '] Result return waits');

        //console.log(results);

        if (config.csv) {
          csvSave(results,'oracle_waits', db.dbid, db.dbname, function(err,result){ if(err) {console.log(err);}});
        }

        if (config.influx) {
          saveData(results,'oracle_waits', db.dbid, db.dbname, function(err){ if(err) {console.log(err);}});
        }
      });

      // Get Physical I/O
        getData(db, generalSQL.phyio, function(results){
        console.log((new Date()) + ' : [' + db.dbname + ' ' + stepNumber + '] Result return phyio');

        //console.log(results);

        if (config.csv) {
          csvSave(results,'oracle_phyio', db.dbid, db.dbname, function(err,result){ if(err) {console.log(err);}});
        }

        if (config.influx) {
          saveData(results,'oracle_phyio', db.dbid, db.dbname, function(err){ if(err) {console.log(err);}});
        }
      });

      // Get Shared pool free
        getData(db, generalSQL.shared_pool_free, function(results){
        console.log((new Date()) + ' : [' + db.dbname + ' ' + stepNumber + '] Result return shared_pool_free');

        //console.log(results);

        if (config.csv) {
          csvSave(results,'oracle_shared_pool_free', db.dbid, db.dbname, function(err,result){ if(err) {console.log(err);}});
        }

        if (config.influx) {
          saveData(results,'oracle_shared_pool_free', db.dbid, db.dbname, function(err){ if(err) {console.log(err);}});
        }
      });


  });

}, config.step);
// default => config.step = (5 * 60 * 1000);


function csvSave(rows, series, dbid, dbname, callback) {
  var message = '';

  rows.forEach(function(row) {
    message += new Date() + ',';
    message += series + ',';
    message += dbid + ',';
    message += dbname + ',';

    for(var column in row){
      message += row[column] + ',';
    };

    message += '\n';
  });

  fs.appendFile(config.csv_filename, message, function (err) {
    return callback(err);
  });
}

function saveData(rows, seriesName, dbid, dbname, callback){
  var influx_conn = influx({
    host : config.influx_hostname,
    port : config.influx_port, 
    username : config.influx_user,
    password : config.influx_password,
    database : config.influx_database
  });

  var rowcount = rows.length;

  var points = [];
  var point = {};

  rows.forEach(function(row) {
    point = {};

    point["DBID"] = dbid;
    point["DBNAME"] = dbname;

    for(var column in row){
      point[column] = row[column];
    };

    if (rowcount > 1 ) {
      points.push(point);
    }
  });

  if (rowcount > 1 ) {
    influx_conn.writePoints(seriesName, points, function(err){
      return callback(err);
    });
  } else {
    influx_conn.writePoint(seriesName, point, function(err){
      return callback(err);
    });
  } 
}

function getData(item, statement, callback) {

  getOracleConn(item.user, item.password, item.connectString, function(err, connection){
    getSQLData(connection, statement, function(err,results){
      if (err) {
        console.error(err.message);
      }

      return callback(results);
    });
  });

}

function getOracleConn(user, password, connectString, callback){
  oracledb.getConnection(
  {
    user          : user,
    password      : password,
    connectString : connectString
  },
  function(err, connection)
  {
    if (err) {
      return callback(err,'');
    }
    
    return callback(err,connection);
  });
}

function getSQLData(connection, statement, callback) {
  connection.execute(
    statement, {},
    {outFormat: oracledb.OBJECT},
    function(err, result) {
      if (err) {
        return callback(err, '');
      }
      var thisResult = result.rows;

      connection.release(function(releaseErr){
        if (releaseErr) {
          console.log(releaseErr);
        }
      });

      return callback(err, thisResult);
    }
  );
}
