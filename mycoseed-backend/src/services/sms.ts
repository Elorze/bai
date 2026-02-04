import Dysmsapi20170525, * as $Dysmsapi20170525 from '@alicloud/dysmsapi20170525'
import * as $OpenApi from '@alicloud/openapi-client'
import dotenv from 'dotenv'

dotenv.config()

const accessKeyId = process.env.ACCESS_KEY_ID
const accessKeySecret = process.env.ACCESS_KEY_SECRET
const signName = process.env.ALIYUN_SMS_SIGN_NAME
const templateCode = process.env.ALIYUN_SMS_TEMPLATE_CODE

if(!accessKeyId || !accessKeySecret || !signName || !templateCode)
{
    console.warn('Warning: SMS environment variables not set. SMS sending will be disabled.')
}

export const sendSMS = async (phone:string, code: string): Promise<any> =>
{
    // 如果环境变量未设置，跳过发送（开发环境）
    if(!accessKeyId || !accessKeySecret || !signName || !templateCode)
    {
        console.log(`[Mock SMS] Sending code ${code} to ${phone}`)
        return { Code: 'OK' }
    }

    const config = new $OpenApi.Config
    ({
        accessKeyId,
        accessKeySecret,
        endpoint:'dysmsapi.aliyuncs.com',
    })

    const client = new Dysmsapi20170525(config)
    const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest
    ({
        phoneNumbers: phone,
        signName,
        templateCode,
        templateParam: JSON.stringify({code}),
    })

    try
    {
        const response = await client.sendSms(sendSmsRequest)
        return response.body
    } catch (error:any)
    {
        console.error('SMS sending error:',error)
        throw new Error(`Failed to send SMS: ${error.message}`)
    }
}
