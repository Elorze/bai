import { Request, Response } from 'express'
import { uploadAvatar, uploadTaskProof } from '../services/storage'
import { AuthRequest, MulterFile } from '../middleware/auth'

/**
 * 上传用户头像
 */
export const uploadAvatarController = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ success: false, message: '未授权' })
    }

    const file = req.file
    if (!file) {
      return res.status(400).json({ success: false, message: '请选择文件' })
    }

    // 验证文件类型（仅图片）
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).json({ success: false, message: '只能上传图片文件' })
    }

    // 验证文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: '图片大小不能超过5MB' })
    }

    // 上传文件
    const result = await uploadAvatar(file.buffer, user.id, file.mimetype)

    res.json({
      success: true,
      url: result.url,
      hash: result.hash
    })
  } catch (error: any) {
    console.error('Upload avatar error:', error)
    res.status(500).json({ success: false, message: error.message || '上传头像失败' })
  }
}

/**
 * 上传任务凭证文件（支持多文件）
 */
export const uploadProofController = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user
    if (!user) {
      return res.status(401).json({ success: false, message: '未授权' })
    }

    const files = req.files as MulterFile[]
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: '请选择文件' })
    }

    const { taskId } = req.body
    if (!taskId) {
      return res.status(400).json({ success: false, message: '缺少任务ID' })
    }

    // 验证文件类型和大小
    const allowedTypes = ['image/', 'application/pdf']
    for (const file of files) {
      const isValidType = allowedTypes.some(type => file.mimetype.startsWith(type))
      if (!isValidType) {
        return res.status(400).json({ 
          success: false, 
          message: `文件 ${file.originalname} 格式不支持，只能上传图片或PDF文件` 
        })
      }

      if (file.size > 10 * 1024 * 1024) {
        return res.status(400).json({ 
          success: false, 
          message: `文件 ${file.originalname} 大小不能超过10MB` 
        })
      }
    }

    // 上传所有文件
    const uploadResults = await Promise.all(
      files.map((file, index) => 
        uploadTaskProof(file.buffer, taskId, user.id, index, file.mimetype)
      )
    )

    // 构建返回数据
    const fileInfos = uploadResults.map((result, index) => ({
      url: result.url,
      hash: result.hash,
      name: files[index].originalname,
      size: files[index].size,
      type: files[index].mimetype
    }))

    res.json({
      success: true,
      files: fileInfos
    })
  } catch (error: any) {
    console.error('Upload proof error:', error)
    res.status(500).json({ success: false, message: error.message || '上传文件失败' })
  }
}

