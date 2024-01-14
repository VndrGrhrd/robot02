'use strict'

const { pdfToText, addDaysToDate } = require("../../common/utils")

class GetDocument {

    async execute(filesPath, title) {
        const model = this.model(0, filesPath.storageid)
        const texContent = await pdfToText(filesPath.pdfpath)
        const pdfmatch = this.pdfMatch(texContent)

        model.type = title
        model.protocol = texContent.match(/Nº\sda\scertidão:\s(\d+)/i)[1]
        model.notation = pdfmatch.notation
        model.analisys = pdfmatch.analisys
        return model
    }

    pdfMatch(text) {
        let status = 'NEGATIVA'
        let message = "Nada consta"

        switch (true) {
            case this.regexTest('NADA\\sCONSTA', text) ||
                this.regexTest('NÃO\\sCONTEM\\sDÉBITO', text) ||
                this.regexTest('NENHUM\\sDÉBITO', text) ||
                this.regexTest('NÃO\\sENCONTRADO', text) ||
                this.regexTest('NEGATIVA', text):
                status = "NEGATIVA"
                message = "Certifico que NADA CONSTA débitos nos registros"
                break;

            case (this.regexTest('CONSTA', text) && !this.regexTest('NADA\\sCONSTA', text)) ||
                this.regexTest('CONSTAM', text) ||
                this.regexTest('POSITIVA', text) ||
                this.regexTest('CONTEM\\sDÉBITO', text) ||
                (this.regexTest('ENCONTRADO\\sDÉBITO', text) && !this.regexTest('NÃO\\sENCONTRADO')):
                status = "POSITIVA"
                message = "Certifico que CONSTAM débitos nos registros"
                break

            default:
                throw "Tipo da certidão não encontrada, retorne a Job para o Desenvolvedor"
        }

        return {
            notation: status,
            analisys: message
        }
    }

    regexTest(regex, text) { return new RegExp(regex, 'gmi').test(text.toUpperCase()) }

    model(daysToAdd = 0, storageID = '') {
        return {
            protocol: '',
            emissionDate: new Date().toLocaleString('pt-BR'),
            validDate: addDaysToDate(new Date(), daysToAdd).toLocaleString('pt-BR'),
            type: '',
            file: storageID,
        }
    }


}
module.exports = new GetDocument()