import { Channel,ConsumeMessage } from "amqplib";
import RabbitMQConfig from "../config/rabbitMQ";
import MessageHandlers from "./messageHandler";



export default class Consumer{
    constructor(private channel :Channel){}


    async consumeMessage(){
        try{
            console.log('ready to consume message from gateway');
            await this.channel.assertQueue(RabbitMQConfig.rabbitMQ.queues.userQueue,{durable:true})
            this.channel.consume(RabbitMQConfig.rabbitMQ.queues.userQueue,async(message:ConsumeMessage | null)=>{
                if(message){
                    const {correlationId,replyTo} = message.properties;
                    const operation = message.properties.headers?.function;
                    console.log('Message properties:', { correlationId, replyTo, operation });
                    if(message.content){
                        const data = JSON.parse(message.content.toString())
                        try{
                            await MessageHandlers.handle(operation,data,correlationId,replyTo)
                        }catch(error){
                            console.log('Error in message handler',error)
                        }
                    }
                }
            },{noAck:true})
        }catch(error){
            console.error("error in consume message in userService",error)
        }
    }
}