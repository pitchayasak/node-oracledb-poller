var config = require('./config.js');
var fs = require('fs');
var generalSQL = require('./sql/generalSQL.js');

var oracledb = require('oracledb');

var stepNumber = 0;

setInterval(function() {
  stepNumber++;

  config.dblists.forEach(function(db) {

      console.log((new Date()) + ' : [' + db.dbname + ' ' + stepNumber + '] Start to query data');

      // Count real-time sessions
      getData(db, generalSQL.sessions, function(results){
        console.log((new Date()) + ' : [' + db.dbname + ' ' + stepNumber + '] Result return sessions');

        //console.log(results);

        if (config.csv) {
          csvSave(results,'oracle_sessions', db.dbid, db.dbname, function(err,result){ if(err) {console.log(err);}});
        }

        //saveData(results,'oracle_sessions', function(err,result){ if(err) {console.log(err);}});
      });

      // Get Tablespaces usaged
      getData(db, generalSQL.tablespaces, function(results){
        console.log((new Date()) + ' : [' + db.dbname + ' ' + stepNumber + '] Result return tablespaces');

        //console.log(results);

        if (config.csv) {
          csvSave(results,'oracle_tablespaces', db.dbid, db.dbname, function(err,result){ if(err) {console.log(err);}});
        }

        //saveData(results,'oracle_tablespaces', function(err,result){ if(err) {console.log(err);}});
      });

      getData(db, generalSQL.waits, function(results){
        console.log((new Date()) + ' : [' + db.dbname + ' ' + stepNumber + '] Result return waits');

        //console.log(results);

        if (config.csv) {
          csvSave(results,'oracle_waits', db.dbid, db.dbname, function(err,result){ if(err) {console.log(err);}});
        }

        //saveData(results,'oracle_waits', function(err,result){ if(err) {console.log(err);}});
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

function saveData(datas, saveCollection, callback){
  MongoClient.connect(url, function(err, db) {
    if(err) { return callback(err,''); }

    var collection = db.collection(saveCollection);
    collection.insert(datas, {w:1}, function(err, result) {
      db.close();

      if(err) { 
        return callback(err,''); 
      }

      return callback('',result)
    });
  });
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
