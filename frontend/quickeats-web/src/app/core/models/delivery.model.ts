export interface Delivery {
    id:number;
    orderId:number;
    partnerName:string;
    partnerPhone:string;
    bikeNumber:string;
    estimatedTime:string;
    status:
        | 'Preparing'
        | 'Picked Up'
        | 'Out For Delivery'
        | 'Delivered';

}