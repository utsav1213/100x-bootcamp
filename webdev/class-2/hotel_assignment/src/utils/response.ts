import { Response } from "express";

export const success = (res: Response, data: any, status = 200) => {
    res.status(status).json({
        success: true,
        data: data,
        error:null
    })
}
export const error = (res:Response,code:any,status:number) => {
    res.status(status).json({
        success: false,
        data: null,
        error:code
    })
}
