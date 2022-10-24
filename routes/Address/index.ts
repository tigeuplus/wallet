import { Wallet } from '@tigeuplus/core'
import * as express from 'express'

export function Address(wallet: Wallet, req: express.Request, res: express.Response, next: express.NextFunction): void
{
    return res.render('address', { address: wallet.address, balance: wallet.getBalance(req.params.address) })
}