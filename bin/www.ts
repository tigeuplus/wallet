import { app } from '../app'
import * as http from 'http'

let port: number = 3001
app.set('port', port)

var server = http.createServer(app)
server.listen(port)
server.on('error', onError)

function onError(error: any) 
{
    if (error.syscall !== `listen`)
        throw error
    switch (error.code) 
    {
        case 'EACCES':
            console.error(`권한이 필요합니다`)
            process.exit(1)

            break

        case 'EADDRINUSE':
            console.error(`포트를 이미 사용하고 있습니다`)
            process.exit(1)

            break

        default:
            throw error
    }
}