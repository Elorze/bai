import { Router } from 'express'
import multer from 'multer'
import { uploadAvatarController, uploadProofController } from '../controllers/uploadController'
import { authenticate } from '../middleware/auth'

const router = Router()

// 配置multer（内存存储）
const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 最大10MB
    }
})

// 上传头像（单文件）
router.post('/avatar', authenticate, upload.single('file'), uploadAvatarController)

// 上传任务凭证照片（多文件）
router.post('/proof', authenticate, upload.array('files', 10), uploadProofController)

export default router