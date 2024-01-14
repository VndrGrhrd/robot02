'use strict'
const IssueVoucher = require('./commands/issueVoucher')
const getDocument = require('./commands/getDocument')

class LowsuitVoucher {
    async execute(jobData) {
        const params = jobData.params
        params.federalDoc = this.findFederalDoc(params)

        const result = await IssueVoucher.execute(params)
        const voucher = await getDocument.execute(result)
        
        if (!voucher || typeof voucher == 'string') return this.unsucessifuly(voucher)
        return this.sucessifuly(voucher)
    }

    findFederalDoc(params) {
        if (params?.cpf && new RegExp('cpf', 'gi').test(params.personType)) return params.cpf
        if (params?.cnpj && new RegExp('cnpj', 'gi').test(params.personType)) return params.cpnj
        if (params?.cpf) return params.cpf
        if (params?.cnpj) return params.cpnj
        else throw 'Documento CPF ou CNPJ não encontrado'
    }

    sucessifuly(voucher) {
        return {
            sucesso: true,
            certidao: voucher,
            mensagem: "Certidão emitida com sucesso",
            dataOperacao: new Date().toLocaleString('pt-BR').replace(/[^\d]/gm, '')
        }
    }

    unsucessifuly(voucher) {
        return {
            sucesso: false,
            mensagem: message || "Não foi possivel emitir a certidão",
            dataOperacao: new Date().toLocaleString('pt-BR').replace(/[^\d]/gm, '')
        }
    }
}
module.exports = LowsuitVoucher