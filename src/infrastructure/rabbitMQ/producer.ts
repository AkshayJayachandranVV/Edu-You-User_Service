import { Channel } from "amqplib";

export default class Producer{
    constructor(private channel : Channel) {}

    async produceMessage(data:any,correlationId:string,replyQueue:string){
        try{
            console.log("entered tot the eproducemessage",data,correlationId,replyQueue)
            this.channel.sendToQueue(replyQueue,Buffer.from(JSON.stringify(data)),{
                correlationId:correlationId
            })
            console.log('message produced');
        }catch(error){
            console.log("Erroor in prodcing message back to apigateway",error)
        }
    }
}