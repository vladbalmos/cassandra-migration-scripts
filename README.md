# cassandra-migration-scripts
Utility scripts for helping with migrating keyspace to another cluster/node

## Steps in migrating a keyspace to another cluster
1. Export the schema from the source cluster:
    
    `echo "DESCRIBE KEYSPACE keyspaceName;" | cqlsh > schema.cql`

2. Create a snapshot of the data:

    `nodeltool snapshot`

3. Archive the data dir

    `tar -czf node.data.tar.gz /var/lib/cassandra/data/[keyspace name]`

4. Download the above schema & data to the destination node
5. Import the schema:

    `cat schema.cql | clqsh`

6. Load the keyspace data into the new node.

If you want to import the keyspace under a different keyspace name run cp-keyspace.js:

    `cp-keyspace.js --src=/path/where/you/untarred/the/data --dst=path/to/new/keyspace/name [--snapshot=snapshot-timestamp]`

Import the data:

    `load-keyspace.js --keyspaceDir=/path/to/keyspace/data --stableloader=/src/cassandra/bin/sstableloader`
