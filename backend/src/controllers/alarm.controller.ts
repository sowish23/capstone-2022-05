import { Request, Response, NextFunction } from "express";
import {s3} from "../../config/s3"
import multerS3 from "multer-s3"
import multer from "multer"

import {Alarm} from "../entity/Alarm";
import {Mapping} from "../entity/Mapping"

interface MulterRequest extends Request {
    file: any;
}

//  public document = async (req: Request, res: Response): Promise<any> => {
//    const documentFile  = (req as MulterRequest).file;
//  }

const upload = multer({
    storage: multerS3({ 
        s3: s3,
        bucket: 'icare-s3',
        contentType: multerS3.AUTO_CONTENT_TYPE, 
        acl: 'public-read',
        
        key: function (req, file, cb) { 
            cb(null, `alarm/${Date.now()}_${file.originalname}`)
        },
    })
})

const sendAlarm = async (req:Request, res:Response, next:NextFunction) => {
    console.log(req.body)
    const alarmCode: string = req.body.alarmCode
    const alarmText: string = req.body.alarmText

    if(!alarmCode || !alarmText){
        res.status(404).json({msg:"값을 채워주세요"}).end()
    }

    const mappingId: number = +req.params.mappingId
    

    const imgName: string = (req as MulterRequest).file.key
    const alarm = new Alarm();

    const mapping : Mapping=  await Mapping.findOne({mappingId:mappingId})

    if (mapping){
        alarm.alarmCode = alarmCode
        alarm.alarmText = alarmText
        alarm.alarmImg = imgName
        alarm.mapping = mapping
    
        await alarm.save()
    
        res.status(201).end()
    }
    else{
        res.status(404).json({msg:"잘못된 mapping요청입니다."}).end()
    }
    
}

export default{
    sendAlarm,
    upload
}