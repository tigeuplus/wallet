import { Node } from '@tigeuplus/core'
import * as express from 'express'
import { existsSync, readFileSync } from 'fs'
import * as path from 'path'

export function Address(node: Node, req: express.Request, res: express.Response, next: express.NextFunction): void
{
    try
    {
        if (existsSync(path.join(node.storage, 'balances', `${req.params.address}.json`)))
            return res.render('address', { address: req.params.address, balance: `${BigInt(readFileSync(path.join(node.storage, 'balances', `${req.params.address}.json`), { encoding: 'utf8' })).toString()}` })
    }
    catch (error: any) {}

    return res.render('address', { address: req.params.address, balance: '0n' })
}