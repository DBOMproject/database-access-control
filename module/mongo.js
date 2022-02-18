const MongoClient = require('mongodb').MongoClient;

let db, clt;

module.exports = {

    connectToServer: function (uri, dbName, callback) {
        MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
            db = client.db(dbName);
            clt = client
            return callback(err);
        });
    },

    getDb: function () {
        return db;
    },

    getClient: function () {
        return clt;
    },

    addRole: async function (db, role, userName, channelId, channelDb, auditPostfix) {
        let actions
        if (role === "read") {
            actions = ["find"]
        }
        else if (role === "write") {
            actions = ["find", "insert", "update"]
        }
        let privileges = [{
            resource: { db: channelDb, collection: channelId + auditPostfix },
            actions: ["find"]
        },
        {
            resource: { db: channelDb, collection: channelId },
            actions: actions
        }]
        await db.command({ createRole: userName + "_role", privileges: privileges, roles: [] });
        return userName + "_role";
    },

    addUser: async function (db, userName, r) {
        await db.addUser(userName, "heythere", { roles: r, db: "admin" });
        return "heythere";
    },

    existUser : async function(db, userName){
        const user = await db.command({usersInfo: userName}) //showCredentials:true gives hash of password
        return user
    },

    updateUser : async function(db, userName, r){
        const user = await db.command({updateUser: userName, roles : r})
        return user
    },

    existRole : async function(db, roleName){
        const role = await db.command({rolesInfo: roleName,showPrivileges: true})
        return role
    },

    updateRole : async function(db, role, userName, channelId, channelDb, auditPostfix, privileges){
        let actions
        if (role === "read") {
            actions = ["find"]
        }
        else if (role === "write") {
            actions = ["find", "insert", "update"]
        }
        let tempPrivileges = [{
            resource: { db: channelDb, collection: channelId + auditPostfix },
            actions: ["find"]
        },
        {
            resource: { db: channelDb, collection: channelId },
            actions: actions
        }]
        privileges = privileges.concat(tempPrivileges);
        await db.command({ updateRole: userName + "_role", privileges: privileges, roles: [] });
        return userName + "_role";
    }
};