
# Database-Access Control for DBoM channels
  
Database Access control module configures access-control to a channel. This module is consumed by the DBoM Federartion Agent service

### Functionalities 

- Configures user access permissions to a channel  
- Starts a database agent for the remote DBoM channel with the received credentials 


## Configuration


| Environment Variable           | Default                      | Description                                                                                                    |
|--------------------------------|------------------------------|----------------------------------------------------------------------------------------------------------------|
 DBAC_PORT                            | `4000`                       | Port on which the database access control app listens                                                                              |
| MONGO_PUBLIC_URI               |                              | Hostname of server on which mongodb container is running|
| MONGO_HOST                     | `mongodb`                    | The host on which mongodb is available                                                                         |
| MONGO_PORT                     | `27017`                      | Port on which mongodb's native driver api is available                                                         |
| MONGO_USER                     |                              | Username for mongo
| MONGO_PASS                     | `pass`                       | Password for mongo host                                                                                        |
| MONGO_REPLICA_SET_NAME         | ``                           | Name of the mongo replicaset. Only required if connecting to an rs mongo                                       |
| CHANNEL_DB                     | `primary`                    | The database used as the channel collection                                                                    |
| AUDIT_POSTFIX                  | `_audit`                     | The postfix added to the audit channel for any given channel                                                   |

## Deployment 

Instructions for deploying the database-access-control using docker-compose can be found [here](https://github.com/DBOMproject/deployments/tree/master/docker-compose-autochannel-setup)

## Getting help

If you have any queries on Database-Access control for DBoM Channels, feel free to reach us on any of our [communication channels](https://github.com/DBOMproject/community/blob/master/COMMUNICATION.md) 

## Getting involved

This project is currently in the MVP stage and we welcome contributions to drive it to completion. Please refer to [CONTRIBUTING](CONTRIBUTING.md) for more information.


