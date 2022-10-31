import { Node } from '@tigeuplus/core'
import { calculateTransactionHash, calculateTransactionNonce, calculateTransferSignature, Transaction, Transfer } from '@tigeuplus/class'
import * as express from 'express'

function stringify(data: any): string
{
    return JSON.stringify(data, (key: string, value: any) => typeof value === 'bigint' ? `${value.toString()}n` : value)
}

function parse(data: any): any
{
    return JSON.parse(data, (key: string, value: any) =>
    {
        if (typeof value === 'string' && /^\d+n$/.test(value)) 
            return BigInt(value.slice(0, value.length - 1))

        return value
    })
}

export function postSend(node: Node, req: express.Request, res: express.Response, next: express.NextFunction, pending?: string): string | undefined
{
    let address: any = req.body.address
    let value: any = req.body.value
    if (typeof address === 'string' && !isNaN(Number(value)))
        if (node.address === address)
            res.status(200).json({ status: 'fail', message: '잘못된 주소' })
        else       
            if ((BigInt(value) <= node.balance) && (BigInt(value) > 0n))
            {
                try
                {
                    let transfer: Transfer = new Transfer(node.address, address, BigInt(value), '')
                    transfer = new Transfer(transfer.from, address, BigInt(value), transfer.memo, transfer.timestamp, calculateTransferSignature(transfer, node.privatekey))
        
                    let transaction: Transaction = new Transaction(transfer.from, [ transfer ], node.calculateTargetSpiders())
                    transaction = new Transaction(transaction.author, transaction.transfers, transaction.targets, transaction.timestamp, calculateTransactionNonce(transaction), calculateTransactionHash(transaction))
        
                    if (node.isTransactionValid(transaction))
                    {
                        node.cobweb.add(transaction)
                        node.omegas = transaction.targets
                        
                        node.broadcast(stringify({ name: 'Add_Transaction', data: transaction }))
        
                        res.status(200).json({ status: 'success', message: '거래 전송 성공' })
                        return transaction.hash
                    }
                }
                catch (error: any) {}
            }
            else
                res.status(200).json({ status: 'fail', message: '잔액 부족' })
    else
        res.status(200).json({ status: 'fail', message: '잘못된 입력' })

    return pending
}

export function Send(node: Node, req: express.Request, res: express.Response, next: express.NextFunction): void
{
    return res.render('send', { address: node.address, balance: node.balance.toLocaleString() })
}