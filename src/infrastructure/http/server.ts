import express from 'express';
import config from '../config/config';
import RabbitMQClient from '../rabbitMQ/client';
import { databaseConnection } from '../database/mongodb';
import { startGrpcServer } from '../grpc/client/grpcServer';
import * as grpc from '@grpc/grpc-js';

const app = express();
app.use(express.json());

const startServer = async () => {
    try {
        console.log("USER SERVER STARTING ------");
        await databaseConnection();

        // RabbitMQ initialization
        RabbitMQClient.initialize();

        // Start gRPC server
        startGrpcServer();

        const port = config.port;

        app.listen(port, () => {
            console.log('User service running on port', port);
        });
    } catch (error) {
        console.log("Error in starting user service", error);
    }
};

startServer();
