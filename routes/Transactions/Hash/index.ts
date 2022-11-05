import { Node } from '@tigeuplus/core'
import * as express from 'express'
import { existsSync, readdirSync, readFileSync } from 'fs'
import * as path from 'path'
import { Json } from '@tigeuplus/utility'
import { Spider, anyToTransaction, Transaction } from '@tigeuplus/class'

export function postTransactionHash(node: Node, req: express.Request, res: express.Response, next: express.NextFunction): express.Response<any, Record<string, any>>
{
    let hash: any = req.body.hash
    if (typeof hash === 'string')
    {
        if (existsSync(path.join(node.storage, 'transactions', `${hash}.json`)))
            return res.status(200).json({ status: 'success', result: true })

        if (node.cobweb.spiders[hash])
            return res.status(200).json({ status: 'success', result: true })
    }

    return res.status(200).json({ status: 'success', result: false })
}

export function TransactionsHash(node: Node, req: express.Request, res: express.Response, next: express.NextFunction): void
{
    let hash: string = req.params.hash
    let process: number = 100
    let spiders: number = 100
    let targetsHtml:string[] = []
    let transfersHtml: string[] = []
    let author: string = '소유자 미존재'

    let spider: Spider | undefined = node.cobweb.spiders[hash]
    let transaction: Transaction | undefined
    if (spider)
    {
        process = Math.min(spider.spiders.length, 100)
        spiders = spider.spiders.length
        for (let i: number = 0; i < spider.transaction.targets.length; i ++)
            transfersHtml.push(
                `<a href="/address/${spider.transaction.targets[i]}">${spider.transaction.targets[i]}</a>`
            )

        author = spider.transaction.author
        for (let i: number = 0; i < spider.transaction.transfers.length; i ++)
        {
            let date: Date = new Date(spider.transaction.transfers[i].timestamp)
            transfersHtml.push(
                `<div class="col-lg-6 mb-4">`
                + `    <div class="card shadow mb-4">`
                + `        <ul class="list-group list-group-flush">`
                + `            <li class="list-group-item">`
                + `                <div class="text-uppercase text-info fw-bold text-xs mb-1">`
                + `                    <h6 class="text-primary fw-bold m-0"><strong><span style="color: rgb(54, 185, 204);">전송 (<a herf="/address/${spider.transaction.transfers[i].to}">${spider.transaction.transfers[i].from}</a>)</span></strong></h6>`
                + `                </div>`
                + `                <div class="row align-items-center no-gutters">`
                + `                    <div class="col me-2">`
                + `                        <div class="row align-items-center no-gutters">`
                + `                            <div class="col me-2">`
                + `                                <div class="row g-0 align-items-center">`
                + `                                    <div class="col-auto">`
                + `                                        <div class="text-dark fw-bold h5 mb-0 me-3"><span><span style="color: rgb(54, 185, 204);">${spider.transaction.transfers[i].value.toLocaleString()} TGX</span></span></div>`
                + `                                    </div>`
                + `                                </div>`
                + `                            </div>`
                + `                        </div>`
                + `                    </div>`
                + `                </div>`
                + `            </li>`
                + `            <li class="list-group-item">`
                + `                <div class="row align-items-center no-gutters">`
                + `                    <div class="col me-2">`
                + `                        <div class="text-uppercase text-info fw-bold text-xs mb-1">`
                + `                            <h6 class="text-primary fw-bold m-0"><strong><span style="color: rgb(231, 74, 59);">수신 (<a href="/address/${spider.transaction.transfers[i].from}">${spider.transaction.transfers[i].from}</a>)</span></strong></h6>`
                + `                        </div>`
                + `                        <div class="row align-items-center no-gutters">`
                + `                            <div class="col me-2">`
                + `                                <div class="row g-0 align-items-center">`
                + `                                    <div class="col-auto">`
                + `                                        <div class="text-dark fw-bold h5 mb-0 me-3"><span><span style="color: rgb(231, 74, 59);">${spider.transaction.transfers[i].value.toLocaleString()} TGX</span></span></div>`
                + `                                    </div>`
                + `                                </div>`
                + `                            </div>`
                + `                        </div>`
                + `                    </div>`
                + `                </div>`
                + `            </li>`
                + `            <li class="list-group-item">`
                + `                <div class="row align-items-center no-gutters">`
                + `                    <div class="col me-2">`
                + `                        <div class="text-uppercase text-info fw-bold text-xs mb-1">`
                + `                            <h6 class="text-primary fw-bold m-0"><span style="color: rgb(58, 59, 69);">메모</span></h6>`
                + `                        </div>`
                + `                        <div class="row align-items-center no-gutters">`
                + `                            <div class="col me-2">`
                + `                                <div class="row g-0 align-items-center">`
                + `                                    <div class="col-auto">`
                + `                                        <div class="text-dark fw-bold h5 mb-0 me-3"><span>${spider.transaction.transfers[i].memo}</span></div>`
                + `                                    </div>`
                + `                                </div>`
                + `                            </div>`
                + `                        </div>`
                + `                    </div>`
                + `                </div>`
                + `            </li>`
                + `            <li class="list-group-item">`
                + `                <div class="row align-items-center no-gutters">`
                + `                    <div class="col me-2">`
                + `                        <div class="text-uppercase text-info fw-bold text-xs mb-1">`
                + `                            <h6 class="text-primary fw-bold m-0"><span style="color: rgb(58, 59, 69);">생성된 시간</span></h6>`
                + `                        </div>`
                + `                        <div class="row align-items-center no-gutters">`
                + `                            <div class="col me-2">`
                + `                                <div class="row g-0 align-items-center">`
                + `                                    <div class="col-auto">`
                + `                                        <div class="text-dark fw-bold h5 mb-0 me-3"><span>${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}-${date.getDay().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}</span></div>`
                + `                                    </div>`
                + `                                </div>`
                + `                            </div>`
                + `                        </div>`
                + `                    </div>`
                + `                </div>`
                + `            </li>`
                + `        </ul>`
                + `    </div>`
                + `</div>`
            )
        }
    }
    else
    {
        if (existsSync(path.join(node.storage, 'transactions', `${hash}.json`)))
            transaction = anyToTransaction(Json.parse(readFileSync(path.join(node.storage, 'transactions', `${hash}.json`), { encoding: 'utf8' })))

        if (transaction)
        {
            author = transaction.author
            for (let i: number = 0; transaction.transfers.length; i ++)
            {
                let date: Date = new Date(transaction.transfers[i].timestamp)
                transfersHtml.push(
                    `<div class="col-lg-6 mb-4">`
                    + `    <div class="card shadow mb-4">`
                    + `        <ul class="list-group list-group-flush">`
                    + `            <li class="list-group-item">`
                    + `                <div class="text-uppercase text-info fw-bold text-xs mb-1">`
                    + `                    <h6 class="text-primary fw-bold m-0"><strong><span style="color: rgb(54, 185, 204);">전송 (<a herf="/address/${transaction.transfers[i].to}">${transaction.transfers[i].from}</a>)</span></strong></h6>`
                    + `                </div>`
                    + `                <div class="row align-items-center no-gutters">`
                    + `                    <div class="col me-2">`
                    + `                        <div class="row align-items-center no-gutters">`
                    + `                            <div class="col me-2">`
                    + `                                <div class="row g-0 align-items-center">`
                    + `                                    <div class="col-auto">`
                    + `                                        <div class="text-dark fw-bold h5 mb-0 me-3"><span><span style="color: rgb(54, 185, 204);">${transaction.transfers[i].value.toLocaleString()} TGX</span></span></div>`
                    + `                                    </div>`
                    + `                                </div>`
                    + `                            </div>`
                    + `                        </div>`
                    + `                    </div>`
                    + `                </div>`
                    + `            </li>`
                    + `            <li class="list-group-item">`
                    + `                <div class="row align-items-center no-gutters">`
                    + `                    <div class="col me-2">`
                    + `                        <div class="text-uppercase text-info fw-bold text-xs mb-1">`
                    + `                            <h6 class="text-primary fw-bold m-0"><strong><span style="color: rgb(231, 74, 59);">수신 (<a href="/address/${transaction.transfers[i].from}">${transaction.transfers[i].from}</a>)</span></strong></h6>`
                    + `                        </div>`
                    + `                        <div class="row align-items-center no-gutters">`
                    + `                            <div class="col me-2">`
                    + `                                <div class="row g-0 align-items-center">`
                    + `                                    <div class="col-auto">`
                    + `                                        <div class="text-dark fw-bold h5 mb-0 me-3"><span><span style="color: rgb(231, 74, 59);">${transaction.transfers[i].value.toLocaleString()} TGX</span></span></div>`
                    + `                                    </div>`
                    + `                                </div>`
                    + `                            </div>`
                    + `                        </div>`
                    + `                    </div>`
                    + `                </div>`
                    + `            </li>`
                    + `            <li class="list-group-item">`
                    + `                <div class="row align-items-center no-gutters">`
                    + `                    <div class="col me-2">`
                    + `                        <div class="text-uppercase text-info fw-bold text-xs mb-1">`
                    + `                            <h6 class="text-primary fw-bold m-0"><span style="color: rgb(58, 59, 69);">메모</span></h6>`
                    + `                        </div>`
                    + `                        <div class="row align-items-center no-gutters">`
                    + `                            <div class="col me-2">`
                    + `                                <div class="row g-0 align-items-center">`
                    + `                                    <div class="col-auto">`
                    + `                                        <div class="text-dark fw-bold h5 mb-0 me-3"><span>${transaction.transfers[i].memo}</span></div>`
                    + `                                    </div>`
                    + `                                </div>`
                    + `                            </div>`
                    + `                        </div>`
                    + `                    </div>`
                    + `                </div>`
                    + `            </li>`
                    + `            <li class="list-group-item">`
                    + `                <div class="row align-items-center no-gutters">`
                    + `                    <div class="col me-2">`
                    + `                        <div class="text-uppercase text-info fw-bold text-xs mb-1">`
                    + `                            <h6 class="text-primary fw-bold m-0"><span style="color: rgb(58, 59, 69);">생성된 시간</span></h6>`
                    + `                        </div>`
                    + `                        <div class="row align-items-center no-gutters">`
                    + `                            <div class="col me-2">`
                    + `                                <div class="row g-0 align-items-center">`
                    + `                                    <div class="col-auto">`
                    + `                                        <div class="text-dark fw-bold h5 mb-0 me-3"><span>${date.getFullYear()}-${date.getMonth().toString().padStart(2, '0')}-${date.getDay().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}</span></div>`
                    + `                                    </div>`
                    + `                                </div>`
                    + `                            </div>`
                    + `                        </div>`
                    + `                    </div>`
                    + `                </div>`
                    + `            </li>`
                    + `        </ul>`
                    + `    </div>`
                    + `</div>`
                )
            }
        }
    }

    if (transfersHtml.length === 0)
        transfersHtml.push(
            `<div class="col-lg-6 mb-4">`
            + `    <div class="card shadow mb-4">`
            + `        <ul class="list-group list-group-flush">`
            + `            <li class="list-group-item">`
            + `                <div class="text-uppercase text-info fw-bold text-xs mb-1">`
            + `                    <h6 class="text-primary fw-bold m-0"><strong><span style="color: rgb(58, 59, 69);">전송 데이터 미존재</span></strong></h6>`
            + `                </div>`
            + `            </li>`
            + `         </ul>`
            + `    </div>`
            + `</div>`
        )

    if (targetsHtml.length === 0)
        targetsHtml.push('타겟 미존재')

    if (!spider && !transaction)
    {
        process = 0
        spiders = 0
    }

    return res.render('transaction', { address: node.address, hash: hash, author: author, process: process, spiders: spiders.toLocaleString(), targetsHtml: targetsHtml.join('  '), transfersHtml: transfersHtml.join(' ') })
}