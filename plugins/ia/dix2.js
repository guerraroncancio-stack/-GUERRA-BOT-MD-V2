import express from 'express'
import multer from 'multer'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import cors from 'cors'

// ========================================
// 👑 GUERRA API CDN
// ========================================

const app = express()

// ========================================
// ⚙️ CONFIG
// ========================================

const PORT =
process.env.PORT || 3000

const DOMAIN =
'https://cdn.guerra-api.com'

// ========================================
// 📂 FOLDERS
// ========================================

const mediaFolder =
'./public/media'

if (!fs.existsSync(mediaFolder)) {

    fs.mkdirSync(
        mediaFolder,
        {
            recursive: true
        }
    )

}

// ========================================
// 🛡️ MIDDLEWARE
// ========================================

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

// ========================================
// 📸 STORAGE
// ========================================

const storage =
multer.diskStorage({

    destination(req, file, cb) {

        cb(
            null,
            mediaFolder
        )

    },

    filename(req, file, cb) {

        const ext =
        path.extname(
            file.originalname
        )

        const random =
        crypto
        .randomBytes(8)
        .toString('hex')

        const filename =

`${Date.now()}-${random}${ext}`

        cb(
            null,
            filename
        )

    }

})

// ========================================
// 📤 UPLOAD
// ========================================

const upload = multer({

    storage,

    limits: {

        fileSize:
        50 * 1024 * 1024

    }

})

// ========================================
// 🌍 HOME
// ========================================

app.get('/', (req, res) => {

    res.json({

        success: true,

        name:
        'GUERRA API CDN',

        creator:
        'Kevin Guerra',

        status:
        'ONLINE',

        upload:
        '/upload'

    })

})

// ========================================
// 🚀 UPLOAD ROUTE
// ========================================

app.post(

    '/upload',

    upload.single('file'),

    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,

                    message:
                    'No file uploaded'

                })

            }

            const fileUrl =

`${DOMAIN}/media/${req.file.filename}`

            return res.json({

                success: true,

                creator:
                'Kevin Guerra',

                file:
                req.file.filename,

                size:
                req.file.size,

                mimetype:
                req.file.mimetype,

                url:
                fileUrl

            })

        } catch (err) {

            console.log(err)

            return res.status(500).json({

                success: false,

                error:
                err.message

            })

        }

    }

)

// ========================================
// 🖼️ STATIC FILES
// ========================================

app.use(

    '/media',

    express.static(
        mediaFolder
    )

)

// ========================================
// ❌ 404
// ========================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message:
        'Route not found'

    })

})

// ========================================
// 🔥 START SERVER
// ========================================

app.listen(PORT, () => {

    console.log(`

╭━━━━━━━━━━━━━━━━━━⬣
┃ 👑 GUERRA API CDN
┃ 🚀 SERVER ONLINE
┃ 🌐 PORT: ${PORT}
┃ ⚡ CREATOR:
┃ ➥ Kevin Guerra
╰━━━━━━━━━━━━━━━━━━⬣

`)

})
