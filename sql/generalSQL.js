exports.sessions = "select (select sum(1) from v$session where type='BACKGROUND') background,(select sum(decode(status,'ACTIVE',1,0))  from v$session where type<>'BACKGROUND') active,(select sum(decode(status,'INACTIVE',1,0))  from v$session where type<>'BACKGROUND') inactive,(select sum(decode(status,'KILLED',1,0))  from v$session where type<>'BACKGROUND') killed,(select count(1) from v$session where status='KILLED' and server='PSUEDO') killed_psuedo from dual";

exports.tablespaces = "select a.tablespace_name, a.bytes_alloc/(1024*1024) max_size_mb, a.physical_bytes/(1024*1024) cur_alloc_mb, nvl(b.tot_used,0)/(1024*1024) cur_used_mb, (nvl(b.tot_used,0)/a.bytes_alloc)*100 percent_max_size, (nvl(b.tot_used,0)/a.physical_bytes)*100 percent_cur_used_size  from (select tablespace_name,  sum(bytes) physical_bytes,  sum(decode(autoextensible,'NO',bytes,'YES',maxbytes)) bytes_alloc from dba_data_files group by tablespace_name ) a, (select tablespace_name, sum(bytes) tot_used from dba_segments group by tablespace_name ) b  where a.tablespace_name = b.tablespace_name (+)  and a.tablespace_name not in (select distinct   tablespace_name  from   dba_temp_files)  and a.tablespace_name not like 'UNDO%'  order by 1";

exports.waits = "select event, time_waited from v$system_event"

exports.phyio = "select name,value from v$sysstat where name in ('physical reads direct', 'physical writes','redo entries')";

exports.shared_pool_free = "select round((sum(decode(name,'free memory',bytes))/sum(bytes))*100,2) as free from v$sgastat where pool = 'shared pool'"
