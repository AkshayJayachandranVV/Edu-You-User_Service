import { Channel,connect,Connection, } from "amqplib";
import RabbitMQConfig from "../config/rabbitMQ"; 
import Consumer from "./consumer";
import Producer from "./producer";


class RabbitMQClient {
    private static instance: RabbitMQClient;
    private connection : Connection |undefined;
    private produceChannel : Channel |undefined;
    private consumerChannel : Channel | undefined;
    private consumer : Consumer |undefined;
    private producer : Producer |undefined;
    private isInitialized =false;

    private constructor(){}


    public static getInstance(){
        if(!this.instance){
            this.instance= new RabbitMQClient();
        }

        return this.instance;
    }



    async initialize(){
        if(this.isInitialized){
            return
        }
        try{
            console.log('Connecting to Rabbitmq..');
            this.connection =  await connect(RabbitMQConfig.rabbitMQ.url)
            console.log('line under connecting to rabbitmq');

            [this.produceChannel,this.consumerChannel] = await Promise.all([this.connection.createChannel(),this.connection.createChannel()])

            await this.produceChannel.assertQueue(RabbitMQConfig.rabbitMQ.queues.userQueue,{durable:true})
            await this.consumerChannel.assertQueue(RabbitMQConfig.rabbitMQ.queues.userQueue,{durable:true})

            this.producer = new Producer(this.produceChannel)
            this.consumer = new Consumer(this.consumerChannel)
            this.consumer.consumeMessage();


            this.isInitialized=true;
        }catch(error){
            console.error('RabbitMQ connection failed. Retrying in 5 seconds...', error);
        setTimeout(() => this.initialize(), 5000); 
        }
    }


    async produce(data:any, correlationId: string, replyToQueue:string){
        console.log("producee 00000000--",data,correlationId,replyToQueue)
        if(!this.isInitialized){
            console.log("hahhahainto instance")
            await this.initialize();
        }
        console.log("instance nite createdgvshsbs000")
        return this.producer?.produceMessage(data,correlationId,replyToQueue)
    }
}

export default RabbitMQClient.getInstance();