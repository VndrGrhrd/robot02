'use strict'

const Utils = require("../../common/utils")

class IssueVoucher {

    get issueCND() { return '[id="emitir"]' }
    get inpName() { return '[name="nome"]' }
    get inpCPF() { return '[name="cpf"]' }
    get btnSubmit() { return '[value*="Emitir certidão"]' }

    async execute(params) {
        await Utils.clickField(this.issueCND)
        await Utils.setFieldValue(this.inpName, params.nome)
        await Utils.setFieldValue(this.inpCPF, params.federalDoc)
        const file = Utils.waitDownloadDocument()
        await Utils.clickField(this.btnSubmit)
        const arquive = await file
        return arquive
    }

}
module.exports = new IssueVoucher()