import express from 'express';
import config from '../config/config';
import RabbitMQClient from '../rabbitMQ/client';
import { databaseConnection } from '../database/mongodb';
import { startGrpcServer } from '../grpc/client/grpcServer';

const app = express();
app.use(express.json());

const startServer = async () => {
    try {
        console.log("USER SERVER STARTING ------");
        await databaseConnection();

        
        // Start gRPC server
        startGrpcServer();

        // RabbitMQ initialization
        RabbitMQClient.initialize();

        const port = config.port;

        app.listen(port, () => {
            console.log('User service running on port', port);
        });
    } catch (error) {
        console.log("Error in starting user service", error);
    }
};

startServer();
