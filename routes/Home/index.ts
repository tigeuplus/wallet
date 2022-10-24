import { anyToTransaction, Transaction, Transfer, Wallet } from '@tigeuplus/core'
import * as express from 'express'
import { readdirSync } from 'fs'
import * as path from 'path'

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

export function Home(wallet: Wallet, req: express.Request, res: express.Response, next: express.NextFunction, hash?: string): void
{
    let transactions: Transaction[] = []
    readdirSync(path.join(wallet.storage, 'transactions'))
        .forEach((file: string): void =>
        {
            let transaction: Transaction | undefined = anyToTransaction(parse(readdirSync(path.join(wallet.storage, 'transactions', file), { encoding: 'utf8' })))
            if (transaction)
                transactions.push(transaction)
        })

    let input: bigint = 0n
    let output: bigint = 0n
    for (let i: number = 0; i < transactions.length; i ++)
        for (let j: number = 0; j < transactions[i].transfers.length; j ++)
            if (transactions[i].transfers[j].from === wallet.address)
                output += transactions[i].transfers[j].value
            else
                input += transactions[i].transfers[j].value

    let latestTransactionsHtml: string[] = []
    let latest: Transaction[] = transactions.sort((a: Transaction, b: Transaction): number => b.timestamp - a.timestamp).slice(0, 5)
    for (let i: number = 0; i < latest.length; i ++)
    {
        let date: Date = new Date(latest[i].timestamp)
        latestTransactionsHtml.push(
            `<li class="list-group-item">`
            + `   <div class="row align-items-center no-gutters">`
            + `       <div class="col mr-2">`
            + `         <h6 class="mb-0"><strong><a href="/transactions/${latest[i].hash}">${latest[i].hash}</a></strong></h6><span class="text-xs">${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}-${date.getDay().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}</span>`
            + `       </div>`
            + `   </div>`
            + `</li>`
            )
    }

    if (latestTransactionsHtml.length === 0)
        latestTransactionsHtml.push(
            `<li class="list-group-item">`
            + `   <div class="row align-items-center no-gutters">`
            + `       <div class="col mr-2">`
            + `         <h6 class="mb-0"><strong>거래 미존재</strong></h6><span class="text-xs"></span>`
            + `       </div>`
            + `   </div>`
            + `</li>`
            )

    let process = 0
    let pendingTransaction: Transaction | undefined
    if (hash)
        if (wallet.cobweb.spiders[hash])
        {
            process = wallet.cobweb.spiders[hash].spiders.length
            pendingTransaction = wallet.cobweb.spiders[hash].transaction
        }

    let pendingTransfersHtml: string[] = []
    if (pendingTransaction)
        for (let i: number = 0; i < pendingTransaction.transfers.length; i ++)
        {
            let date: Date = new Date(pendingTransaction.transfers[i].timestamp)
            pendingTransfersHtml.push(
                `<li class="list-group-item">`
                + `   <div class="row align-items-center no-gutters">`
                + `       <div class="col me-2">`
                + `         <div class="text-uppercase text-info fw-bold text-xs mb-1">`
                + `             <h6 class="text-primary fw-bold m-0"><strong><span style="color: rgb(${pendingTransaction.transfers[i].from === wallet.address ? '54 185 204' : '231, 74, 59'});">${pendingTransaction.transfers[i].from === wallet.address ? `전송` : `수신`} (<a href="/address/${pendingTransaction.transfers[i].from === wallet.address ? pendingTransaction.transfers[i].to : pendingTransaction.transfers[i].from}">${pendingTransaction.transfers[i].from === wallet.address ? pendingTransaction.transfers[i].to : pendingTransaction.transfers[i].from}</a>)</span></strong></h6>`
                + `         </div>`
                + `         <div class="row align-items-center no-gutters">`
                + `             <div class="col me-2">`
                + `                 <div class="row g-0 align-items-center">`
                + `                     <div class="col-auto">`
                + `                         <div class="text-dark fw-bold h5 mb-0 me-3"><span><span style="color: rgb(${pendingTransaction.transfers[i].from === wallet.address ? '54 185 204' : '231, 74, 59'});">${pendingTransaction.transfers[i].value.toLocaleString()} TGX</span></span></div>`
                + `                     </div>`
                + `                 <div class ="col><span class="text-xs">${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}-${date.getDay().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}</span></div>`
                + `             </div>`
                + `         </div>`
                + `     </div>`
                + ` </div>`
                + `</li>`
            )
        }

    if (pendingTransfersHtml.length === 0)
        pendingTransfersHtml.push(
            `<li class="list-group-item">`
            + `   <div class="row align-items-center no-gutters">`
            + `       <div class="col mr-2">`
            + `         <h6 class="mb-0"><strong>전송 데이터 미존재</strong></h6><span class="text-xs"></span>`
            + `       </div>`
            + `   </div>`
            + `</li>`
            )

    return res.render('index', { address: wallet.address, balance: wallet.balance.toLocaleString(), input: input.toLocaleString(), output: output.toLocaleString(), latestTransactionsHtml: latestTransactionsHtml.join('    '), pendingTransfersHtml: pendingTransfersHtml.join('    '), process: process })
}

