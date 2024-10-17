import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { userController } from '../../../interface/controllers/userController';
import config from '../../config/config';

const USER_PROTO_PATH = path.resolve(__dirname, '../proto/user.proto');

const userPackageDefinition = protoLoader.loadSync(USER_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const loginUser = (call:any, callback: any) => {
    console.log("Login attempt for user:");



     // Prepare response
    callback(null, true); // Send the response
};

const userProtoDescription = grpc.loadPackageDefinition(userPackageDefinition) as any;

const userProto = userProtoDescription.user;

const server = new grpc.Server();

//userController
server.addService(userProto.UserService.service, {
    login: loginUser // Update this to the correct method name
});


const startGrpcServer = () => {
    const grpcPort = config.grpcPort;
    server.bindAsync(`0.0.0.0:${grpcPort}`, grpc.ServerCredentials.createInsecure(), (err, bindPort) => {
        if (err) {
            console.error("Failed to start grpc server:", err);
            return;
        } else {
            console.log(`gRpc server running at http://0.0.0.0:${bindPort}`);
        }
    });
};

export { startGrpcServer };
