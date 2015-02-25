var config = {}

config.dblists = [
  {
    "dbid" : 2752939624,
    "dbname" : "XE", 
    "user" : "ashlogger", 
    "password" : "ashlogger", 
    "connectString" : "localhost/XE" 
  }
]
;

config.csv = true;
config.csv_filename = "/tmp/db_metrics.csv";


config.step = (5 * 60 * 1000);

module.exports = config;
