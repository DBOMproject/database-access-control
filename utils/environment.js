require("dotenv").config()

exports.getMongoURIFromEnv = (remote) => {
    const { env } = process;
    //if (env.MONGO_URI) return env.MONGO_URI;

    const host = env.MONGO_HOST || 'mongodb';
    const port = env.MONGO_PORT || '27017';
    const user = env.MONGO_USER || 'root';
    const secretPass = env.MONGO_PASS_KEY || 'mongodb-root-password';
    const pass = env[secretPass] || env.MONGO_PASS || 'pass';
    const hostname = env.MONGO_PUBLIC_URI;
    let replicaSetParameter = '';

    if (env.MONGO_REPLICA_SET_NAME && env.MONGO_REPLICA_SET_NAME !== '') {
        replicaSetParameter = `?replicaSet=${env.MONGO_REPLICA_SET_NAME}`;
    }
    if(remote){
        return `mongodb://${user}:${pass}@${hostname}:${port}/${replicaSetParameter}`;
    }
    return `mongodb://${user}:${pass}@${host}:${port}/${replicaSetParameter}`;
 };