import { Node } from '@tigeuplus/core'
import * as express from 'express'
import { readdirSync, readFileSync } from 'fs'
import * as path from 'path'
import { Json } from '@tigeuplus/utility'
import { anyToTransaction, Transaction } from '@tigeuplus/class'

export function Transactions(node: Node, req: express.Request, res: express.Response, next: express.NextFunction): void
{
    let transactions: Transaction[] = []
    readdirSync(path.join(node.storage, 'transactions'))
        .forEach((file: string): void =>
        {
            let transaction: Transaction | undefined = anyToTransaction(new Json().parse(readFileSync(path.join(node.storage, 'transactions', file), { encoding: 'utf8' })))
            if (transaction)
                transactions.push(transaction)
        })

    let transactionsHtml: string[] = []
    for (let i: number = 0; i < transactions.length; i ++)
    {
        let date: Date = new Date(transactions[i].timestamp)
        transactionsHtml.push(
            `<li class="list-group-item">`
            + `   <div class="row align-items-center no-gutters">`
            + `       <div class="col mr-2">`
            + `         <h6 class="mb-0"><strong><a href="/transactions/${transactions[i].hash}">${transactions[i].hash}</a></strong></h6><span class="text-xs">${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}-${date.getDay().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}</span>`
            + `       </div>`
            + `   </div>`
            + `</li>`
            )
    }

    if (transactionsHtml.length === 0)
        transactionsHtml.push(
            `<li class="list-group-item">`
            + `   <div class="row align-items-center no-gutters">`
            + `       <div class="col mr-2">`
            + `         <h6 class="mb-0"><strong>거래 미존재</strong></h6><span class="text-xs"></span>`
            + `       </div>`
            + `   </div>`
            + `</li>`
            )

    return res.render('transactions', { address: node.address, transactionsHtml: transactionsHtml.join('  ') })
}

export * from './Hash'