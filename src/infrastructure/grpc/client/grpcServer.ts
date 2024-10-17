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

const loginUser = (call: grpc.ServerUnaryCall<any, any>, callback: grpc.sendUnaryData<any>) => {
    const { username, password } = call.request; // Get data from the request
    console.log(`Login attempt for user: ${username}`);

    // Simulate a login check (this should be replaced with your actual logic)
    const success = username === 'admin' && password === 'password'; // Example condition

    const response: any = { success }; // Prepare response
    callback(null, response); // Send the response
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
