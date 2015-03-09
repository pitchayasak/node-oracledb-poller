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

config.influx = true;
config.influx_hostname = 'localhost';
config.influx_port = '8086';
config.influx_user = 'monit-repo';
config.influx_password = 'monit-repo';
config.influx_database = 'poller_repo';

config.step = (5 * 60 * 1000);

module.exports = config;
