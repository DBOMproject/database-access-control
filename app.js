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
const http = require("http")

const app = require("./server")

const port = process.env.DBAC_PORT || 4000
app.set("port", port)

const server = http.createServer(app)

// start a server
server.listen(port, () => {
	try {
		console.log(`🚀 Server ready at http://localhost:${port}`)
	} catch (error) {
		console.error(`${error} Error starting server`)
	}
})