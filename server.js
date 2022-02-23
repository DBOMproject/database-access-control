/*
 * Copyright 2022 Unisys Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
require("dotenv").config()
const env = require('./utils/environment');
const express = require("express")
const app = express()
const mongoUtil = require('./module/mongo');
const mongo = require("./module/mongo");
const { dockerCommand } = require('docker-cli-js');


const { updateRole } = require("./module/mongo");

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

const channelDb = process.env.CHANNEL_DB || 'primary';
const auditPostfix = process.env.AUDIT_POSTFIX || '_audit';

const options = {
	machineName: null, // uses local docker
	currentWorkingDirectory: null, // uses current working directory
	echo: true, // echo command output to stdout/stderr
  };

// Setup a default catch-all route that sends back a welcome message in JSON format.
app.get("/test", (req, res) =>
	res.status(200).send({
		message: "Welcome to page.",
	})
)

/*
roleName is role aray
*/
app.post("/addUser", async (req, res) => {
	try {
		const uri = env.getMongoURIFromEnv();

		const {  userName, role, channelId} = req.body;
		
		// role array for the creation of user 
		let roleName = req.body.roleName;
		//for storing the roles of a user if already user exist
		let roles;	
		//for storing the privileges of the role : userName_role if this role exist		
		let privileges;

		mongoUtil.connectToServer(uri, "admin", async function (err) {
			if
				(err) console.log(err);
			else {
				const db = await mongoUtil.getDb();
				const client = await mongoUtil.getClient();
				
				const user = await mongoUtil.existUser(db,userName);
				//check if the user exist or not 
				if(user.users.length != 0){
					roles = user.users[0].roles;
					roles = roles.map(a => a.role);
				}

				/*	if the roleName array is not provided then only we will create/update the
					role : userName_role */
				if(!roleName){
					//check if the role userName_role already exist
					const checkRoleName = await mongoUtil.existRole(db,userName + "_role");
					
					//if the role exist then we will update the role and exit the function
					if(checkRoleName.roles.length != 0){
						privileges = checkRoleName.roles[0].privileges
						roleName = await mongoUtil.updateRole(db, role, userName, channelId, channelDb, auditPostfix, privileges);
						res.json({"status": "role userName_role updated"})
						await client.close();
						return;
					}
					// if the role doesn't exist we will create the new role which will be added to the user later
					else
						roleName = await mongoUtil.addRole(db, role, userName, channelId, channelDb, auditPostfix);
				}	
				
				/*	if the roles array doesn't exist then it indicates that new user shall be created and vice versa */	
				if(!roles){
					const pwd = await mongoUtil.addUser(db, userName, roleName);
					const remoteUri = env.getMongoURIFromEnv(1)
					res.json({ userName: userName, pwd: pwd, uri: remoteUri });
				}
				else{
					roles = roles.concat(roleName);
					await mongoUtil.updateUser(db,userName,roles)
					res.json({ status: "Successfully updated the user"})
				}

				await client.close();
			}
		});
	}
	catch (err) {
		res.json({ success: false });
		console.log(err);
	}
});


// endpoint to add the new role explicitly
app.post("/addRole", async (req, res) => {
	try {
		const uri = env.getMongoURIFromEnv()

		const { userName, channelId, role } = req.body

		mongoUtil.connectToServer(uri, "admin", async function (err) {
			if
				(err) console.log(err);
			else {
				const db = await mongoUtil.getDb();
				const client = await mongoUtil.getClient();

				await mongoUtil.addRole(db, role, userName, channelId, channelDb, auditPostfix);

				res.json({ success: true });

				await client.close();
			}
		});
	}
	catch (err) {
		res.json({ success: false });
		console.log(err);
	}
});

app.post('/startAgent', async (req, res) => {
	const {uri, userName, pwd, repoID, dbAgentPort, network } = req.body;
	try {
		let data = await dockerCommand(`run -d -p ${parseInt(dbAgentPort)}:${parseInt(dbAgentPort)} --network=${network}  --name=database-agent-${repoID} -e MONGO_URI=${uri} -e MONGO_USER=${userName} -e MONGO_PASS=${pwd} -e CHANNEL_DB=${channelDb} -e AUDIT_POSTFIX='_audit' dbomproject/database-agent`, options);
        let filter = `id=${data.containerId}`;
		let runningContainer = await dockerCommand(`ps --filter ${filter}`);
		if(runningContainer.containerList.length!=0){
		res.json({ host: `database-agent-${repoID}`, agentPort: dbAgentPort });
		}
		else {
			res.status(400).json({ status: "Agent not started" });
		}
	}
	catch (err) {	
		res.json({ success: false });
		console.log(err);
	}
});

module.exports = app