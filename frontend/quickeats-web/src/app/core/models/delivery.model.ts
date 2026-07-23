export interface Delivery {
    id:number;
    orderId:number;
    partnerName:string;
    partnerPhone:string;
    bikeNumber:string;
    estimatedTime:string;
    status:
        | 'Preparing'
        | 'Out For Delivery'
        | 'Delivered';

}