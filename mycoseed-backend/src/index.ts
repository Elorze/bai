// 环境配置：必须在所有其他导入之前执行
// 这会立即加载环境变量，确保后续导入的模块可以访问到环境变量
import './config/env'

import express from 'express'
import cors from 'cors'
import tasksRouter from './routes/tasks'
import authRouter from './routes/auth'
import uploadRouter from './routes/upload'
import diagnosticsRouter from './routes/diagnostics'

const nodeEnv = process.env.NODE_ENV || 'development'

const app = express()
const PORT = process.env.PORT || 3001

// CORS 配置 - 允许 Vercel 前端域名
const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // 允许的域名列表
    const allowedOrigins = [
      process.env.FRONTEND_URL, // Vercel 部署的前端 URL
      'http://localhost:3000',   // 本地开发
      'http://localhost:5173', // VITE默认端口
      'http://localhost:3003'  
    ].filter(Boolean) // 过滤掉 undefined
    
    // 开发环境允许所有来源，生产环境只允许配置的域名
    if (nodeEnv === 'development' || !origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}

// 中间件
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'MycoSeed Backend API is running',
    environment: nodeEnv
  })
})

// 测试上传路由是否可用
app.get('/api/upload/test', (req, res) => {
  res.json({ status: 'ok', message: 'Upload routes are available' })
})

// 路由
app.use('/api/tasks', tasksRouter)
app.use('/api/auth',authRouter)
app.use('/api/upload',uploadRouter)
app.use('/api/diagnostics', diagnosticsRouter)  // 诊断路由（开发用）

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`)
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`)
  console.log(`🌍 Environment: ${nodeEnv}`)
})