import createHttpError from 'http-errors'
import * as express from 'express'
import * as path from 'path'
import cookieParser from 'cookie-parser'
import { Node } from '@tigeuplus/core'
import { Home, TransactionsHash, Transactions, Address, Send, postTransactionHash, postSend } from './routes'

let node: Node = new Node(path.join(__dirname, 'storage'), 1000, 6001, '') // 피어 주소를 입력해주세요
let pending: string | undefined

let app: express.Express = express.default()
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use('/js', express.static(path.join(__dirname, 'public', 'javascripts')))
app.use('/css', express.static(path.join(__dirname, 'public', 'stylesheets')))
app.use('/fonts', express.static(path.join(__dirname, 'public', 'fonts')))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

let home: express.Router = express.Router()
home.get('/', (req: express.Request, res: express.Response, next: express.NextFunction):  void => Home(node, req, res, next, pending))

let transactions: express.Router = express.Router()
transactions.get('/', (req: express.Request, res: express.Response, next: express.NextFunction):  void => Transactions(node, req, res, next))
transactions.get('/:hash', (req: express.Request, res: express.Response, next: express.NextFunction):  void => TransactionsHash(node, req, res, next))
transactions.post('/', (req: express.Request, res: express.Response, next: express.NextFunction):  void =>
{
    postTransactionHash(node, req, res, next)
})

let send: express.Router = express.Router()
send.get('/', (req: express.Request, res: express.Response, next: express.NextFunction):  void => Send(node, req, res, next))
send.post('/', (req: express.Request, res: express.Response, next: express.NextFunction):  void =>
{
    pending = postSend(node, req, res, next, pending)
})

let address: express.Router = express.Router()
address.get('/:address', (req: express.Request, res: express.Response, next: express.NextFunction):  void => Address(node, req, res, next))

app.use('/', home)
app.use('/transactions', transactions)
app.use('/send', send)
app.use('/address', address)

app.use((req: express.Request, res: express.Response, next: express.NextFunction) => 
{
    next(createHttpError(404))
})

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => 
{
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    res.status(err.status || 500)
    res.render('error')
})

export { app }